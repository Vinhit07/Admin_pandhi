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
import { Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useOutlet } from "../context/OutletContext"
import { expenditureService, reportService } from "../services"
import type { Expense } from "../types/api"

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

    useEffect(() => {
        if (outletId) {
            setLoading(true)
            fetchData()
        } else {
            setLoading(false)
        }
    }, [outletId])

    const fetchData = async () => {
        if (!outletId) return
        try {
            setLoading(true)
            const [expensesRes, overviewRes] = await Promise.all([
                expenditureService.getExpenses(outletId),
                reportService.getDashboardOverview()
            ])

            if (expensesRes.success && expensesRes.data) {
                setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : [])
            }

            if (overviewRes.success && overviewRes.data) {
                setStats({
                    totalRevenue: overviewRes.data.totalRevenue || 0,
                    totalExpenses: 0, // Calculate from expenses or from API if available
                    netProfit: overviewRes.data.totalRevenue || 0,
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
    }

    const handleAddExpense = async () => {
        if (!category || !description || !amount || !expenseDate || !outletId) {
            alert("Please fill in all required fields")
            return
        }

        try {
            const response = await expenditureService.addExpense({
                category,
                description,
                amount: parseFloat(amount),
                date: expenseDate,
                outletId
            })

            if (response.success) {
                alert("Expense added successfully")
                handleReset()
                fetchData()
            }
        } catch (error) {
            console.error("Error adding expense:", error)
            alert("Failed to add expense")
        }
    }

    // Expense Tracker Columns
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
            accessorKey: "amount",
            header: "AMOUNT",
            cell: ({ row }) => (
                <span className="font-semibold">₹{row.getValue("amount")}</span>
            ),
        },
        {
            accessorKey: "date",
            header: "DATE",
            cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString()
        },
        {
            accessorKey: "createdByName",
            header: "CREATED BY",
            cell: ({ row }) => row.original.createdByName || "N/A"
        },
    ]

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (expense.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    // Calculate total expenses from filtered data
    const totalExpensesAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Tabs Container */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="tracker" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="tracker">Expense Tracker</TabsTrigger>
                        <TabsTrigger value="add">Add Expense</TabsTrigger>
                    </TabsList>

                    {/* Expense Tracker Tab */}
                    <TabsContent value="tracker" className="space-y-6">
                        {/* Date Filters and Clear */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* From Date */}
                                <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">From Date</span>
                                    <Input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-32"
                                    />
                                </div>

                                {/* To Date */}
                                <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">To Date</span>
                                    <Input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-32"
                                    />
                                </div>
                            </div>

                            {/* Clear Button */}
                            <Button variant="outline" onClick={handleClear} className="rounded-full px-6 shadow-md">
                                Clear
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Total revenue</p>
                                    <p className="text-3xl font-bold text-primary">₹{stats.totalRevenue.toLocaleString()}</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Total expenses</p>
                                    <p className="text-3xl font-bold text-destructive">₹{totalExpensesAmount.toLocaleString()}</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Net profit</p>
                                    <p className="text-3xl font-bold text-green-600">₹{(stats.totalRevenue - totalExpensesAmount).toLocaleString()}</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Total orders</p>
                                    <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search */}
                        <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 max-w-md ml-auto">
                            <Search size={20} className="text-muted-foreground" />
                            <Input
                                placeholder="Search by category or description"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                            />
                        </div>

                        {/* Expense Tracker Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Expense Tracker</h3>
                            <DataTable columns={expenseColumns} data={filteredExpenses} />
                        </div>
                    </TabsContent>

                    {/* Add Expense Tab */}
                    <TabsContent value="add" className="space-y-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <h3 className="text-xl font-semibold mb-6">Add New Expense</h3>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date *</label>
                                    <Input
                                        type="date"
                                        value={expenseDate}
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category *</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Utilities">Utilities</SelectItem>
                                            <SelectItem value="Supplies">Supplies</SelectItem>
                                            <SelectItem value="Salaries">Salaries</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Rent">Rent</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Expense Description */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Expense Description *</label>
                                    <Input
                                        placeholder="Enter description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Amount */}
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

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Method</label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                                <Button variant="destructive" onClick={handleReset} className="rounded-full px-8">
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
        </div>
    )
}
