import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Card, CardContent } from "../components/ui/card"
import { Search, Loader2, RefreshCw } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useOutlet } from "../context/OutletContext"
import { expenditureService, reportService } from "../services"
import { toast } from "react-hot-toast"
import { formatDateDDMMYYYY } from "../lib/dateUtils"
// import type { Expense } from "../types/api" // Removed to define local interface matching your real API

// 1. Defined Interface based on your Console Log
interface Expense {
    id: number
    category: string
    description: string
    amount: number
    expenseDate: string
    method: string // Added based on log
    paidTo: string // Added based on log
    createdAt: string
}

export const ExpenditureManagement = () => {
    const { outletId } = useOutlet()

    const [searchQuery, setSearchQuery] = useState("")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(false)

    // Stats from dashboard
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalOrders: 0
    })

    // Form states
    const [expenseDate, setExpenseDate] = useState("")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("")
    const [paidTo, setPaidTo] = useState("")
    const [selectedOutletId, setSelectedOutletId] = useState<number | string>("")

    const { outlets } = useOutlet() // Get outlets list for dropdown

    useEffect(() => {
        // Fetch initially or when outletId changes (including when it's null/'ALL')
        fetchData()
    }, [outletId])

    const fetchData = async () => {
        try {
            setLoading(true)
            // Handle null as 'ALL' (or 0 if needed by service, but payload below handles it)
            const targetOutletId = outletId || "ALL"

            const payload = {
                outletId: (targetOutletId === 'ALL') ? 0 : targetOutletId
            }
            const [expensesRes, overviewRes] = await Promise.all([
                expenditureService.getExpenses(targetOutletId),
                reportService.getDashboardOverview(payload)
            ])
            console.log("💰 Expenditure Response:", expensesRes)

            // 2. FIXED: Robust check for data (ignores missing 'success' flag)
            let fetchedExpenses: Expense[] = []

            if (expensesRes?.data && Array.isArray(expensesRes.data)) {
                fetchedExpenses = expensesRes.data
            } else if (Array.isArray(expensesRes)) {
                fetchedExpenses = expensesRes
            }

            setExpenses(fetchedExpenses)

            // Calculate local total expenses
            const calculatedTotalExpenses = fetchedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

            if (overviewRes?.data) {
                setStats({
                    totalRevenue: overviewRes.data.totalRevenue || 0,
                    totalExpenses: calculatedTotalExpenses, // Use real calculated value
                    netProfit: (overviewRes.data.totalRevenue || 0) - calculatedTotalExpenses,
                    totalOrders: overviewRes.data.totalOrders || 0
                })
            }
        } catch (error) {
            console.error("Error fetching expenditure data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setFromDate("")
        setToDate("")
        setSearchQuery("")
    }

    const handleReset = () => {
        setExpenseDate("")
        setCategory("")
        setDescription("")
        setAmount("")
        setPaymentMethod("")
        setPaidTo("")
        setSelectedOutletId("")
    }

    const handleAddExpense = async () => {
        // Validate required fields
        if (!category || !description || !amount || !expenseDate || !paidTo) {
            toast.error("Please fill in all required fields")
            return
        }

        // Determine which outlet ID to use
        const targetOutletId = (outletId && outletId !== "ALL") ? outletId : selectedOutletId

        // Check outlet selection - must be a specific outlet
        if (!targetOutletId || targetOutletId === "ALL") {
            toast.error("Please select a specific outlet to add an expense")
            return
        }

        try {
            const response = await expenditureService.addExpense({
                category,
                description,
                amount: parseFloat(amount),
                expenseDate: expenseDate,
                outletId: typeof targetOutletId === 'string' ? parseInt(targetOutletId) : targetOutletId,
                method: paymentMethod,
                paidTo: paidTo
            })
            console.log("Add Expense Response:", response)

            // Check for success based on typical API response structures
            if (response.success || response.data || response.message === "Expense created successfully") {
                toast.success("Expense added successfully")
                handleReset()
                fetchData() // Refresh list
            } else {
                // If API returns 200 but logic says failure (rare with this backend but good safety)
                toast.error(response.message || "Failed to add expense")
            }
        } catch (error: any) {
            console.error("Error adding expense:", error)
            toast.error(error.message || "Failed to add expense")
        }
    }

    // 3. FIXED: Columns to match API Data (paidTo, method)
    const expenseColumns: ColumnDef<Expense>[] = [
        {
            accessorKey: "category",
            header: "CATEGORY",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("category")}</span>
            ),
        },
        {
            accessorKey: "description",
            header: "DESCRIPTION",
        },
        {
            accessorKey: "paidTo",
            header: "PAID TO",
            cell: ({ row }) => row.original.paidTo || "-",
        },
        {
            accessorKey: "method",
            header: "METHOD",
            cell: ({ row }) => row.original.method || "-",
        },
        {
            accessorKey: "amount",
            header: "AMOUNT",
            cell: ({ row }) => (
                <span className="font-semibold text-red-600">₹{row.getValue("amount")}</span>
            ),
        },
        {
            accessorKey: "expenseDate",
            header: "DATE",
            cell: ({ row }) => {
                const dateVal = row.getValue("expenseDate") as string
                return dateVal ? formatDateDDMMYYYY(dateVal) : "-"
            }
        },
    ]

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (expense.description || '').toLowerCase().includes(searchQuery.toLowerCase())

        // Add Date Filtering logic if needed
        let matchesDate = true
        if (fromDate && toDate) {
            const expDate = new Date(expense.expenseDate)
            const start = new Date(fromDate)
            const end = new Date(toDate)
            matchesDate = expDate >= start && expDate <= end
        }

        return matchesSearch && matchesDate
    })

    const totalExpensesAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

    if (loading && expenses.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Expenditure Management</h1>
                <p className="text-muted-foreground">Track and manage business expenditures</p>
            </div>
            {/* Removed the heavy outer container and kept the Tabs structure flat */}
            <Tabs defaultValue="tracker" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 h-12">
                    <TabsTrigger value="tracker" className="rounded-lg">Expense Tracker</TabsTrigger>
                    <TabsTrigger value="add" className="rounded-lg">Add Expense</TabsTrigger>
                </TabsList>

                {/* Expense Tracker Tab */}
                <TabsContent value="tracker" className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 h-11 px-4">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">From</span>
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-auto h-full p-0"
                                />
                            </div>

                            <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 h-11 px-4">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">To</span>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-auto h-full p-0"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleClear} className="rounded-xl h-11 px-4 shadow-sm border-border/50">
                                    Clear
                                </Button>
                                <Button variant="outline" onClick={fetchData} className="rounded-xl h-11 px-4 shadow-sm border-border/50" title="Refresh Data">
                                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                </Button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 w-full md:w-64 h-11 px-4">
                            <Search size={18} className="text-muted-foreground shrink-0" />
                            <Input
                                placeholder="Search expenses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full p-0"
                            />
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="rounded-xl border border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">Total revenue</p>
                                <p className="text-3xl font-bold text-primary">₹{stats.totalRevenue.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">Total expenses</p>
                                <p className="text-3xl font-bold text-destructive">₹{totalExpensesAmount.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">Net profit</p>
                                <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹{(stats.totalRevenue - totalExpensesAmount).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border/50 shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">Total orders</p>
                                <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expense Tracker Table */}
                    <DataTable columns={expenseColumns} data={filteredExpenses} pageSize={50} />
                    {filteredExpenses.length === 0 && !loading && (
                        <div className="text-center py-10 text-muted-foreground">
                            No expenses found.
                        </div>
                    )}
                </TabsContent>

                {/* Add Expense Tab */}
                <TabsContent value="add" className="space-y-6">
                    <div className="max-w-3xl mx-auto bg-card p-6 rounded-2xl border shadow-sm">
                        <h3 className="text-xl font-semibold mb-6">Add New Expense</h3>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Outlet Selection - Only show if in "All Outlets" view */}
                            {(!outletId || outletId === "ALL") && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Outlet <span className="text-destructive">*</span></label>
                                    <Select value={selectedOutletId.toString()} onValueChange={(value) => setSelectedOutletId(value)}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Outlet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {outlets.map((outlet) => (
                                                <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                                    {outlet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date *</label>
                                <Input
                                    type="date"
                                    value={expenseDate}
                                    onChange={(e) => setExpenseDate(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category *</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Shopping">Shopping</SelectItem>
                                        <SelectItem value="Utilities">Utilities</SelectItem>
                                        <SelectItem value="Supplies">Supplies</SelectItem>
                                        <SelectItem value="Salaries">Salaries</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Rent">Rent</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Expense Description *</label>
                                <Input
                                    placeholder="Enter description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Paid To *</label>
                                <Input
                                    placeholder="Enter payee name (e.g., Vendor Name)"
                                    value={paidTo}
                                    onChange={(e) => setPaidTo(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount (₹) *</label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="CARD">Card</SelectItem>
                                        <SelectItem value="WALLET">Wallet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Button variant="outline" onClick={handleReset} className="rounded-full px-8">
                                Reset
                            </Button>
                            <Button onClick={handleAddExpense} className="rounded-full px-8 bg-green-600 hover:bg-green-700">
                                Add Expense
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}