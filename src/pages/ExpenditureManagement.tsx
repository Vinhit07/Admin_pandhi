import { useState } from "react"
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
import { Search } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

interface Expense {
    category: string
    description: string
    amount: string
    date: string
    paymentMethod: string
}

const mockExpenses: Expense[] = [
    { category: "Utilities", description: "Electricity bill", amount: "₹5,000", date: "15-01-2026", paymentMethod: "Bank Transfer" },
    { category: "Supplies", description: "Kitchen supplies", amount: "₹12,000", date: "14-01-2026", paymentMethod: "Cash" },
    { category: "Salaries", description: "Staff salaries", amount: "₹80,000", date: "10-01-2026", paymentMethod: "Bank Transfer" },
    { category: "Maintenance", description: "Equipment repair", amount: "₹3,500", date: "08-01-2026", paymentMethod: "UPI" },
    { category: "Rent", description: "Monthly rent", amount: "₹25,000", date: "01-01-2026", paymentMethod: "Bank Transfer" },
]

export const ExpenditureManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [fromDate, setFromDate] = useState("dd-mm-yyyy")
    const [toDate, setToDate] = useState("dd-mm-yyyy")
    const [expenses] = useState(mockExpenses)

    // Form states
    const [expenseDate, setExpenseDate] = useState("dd-mm-yyyy")
    const [category, setCategory] = useState("")
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("")
    const [paidTo, setPaidTo] = useState("")

    const handleClear = () => {
        setFromDate("dd-mm-yyyy")
        setToDate("dd-mm-yyyy")
        setSearchQuery("")
    }

    const handleReset = () => {
        setExpenseDate("dd-mm-yyyy")
        setCategory("")
        setDescription("")
        setAmount("")
        setPaymentMethod("")
        setPaidTo("")
    }

    const handleAddExpense = () => {
        // Handle add expense logic
        console.log("Adding expense:", { expenseDate, category, description, amount, paymentMethod, paidTo })
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
                <span className="font-semibold">{row.getValue("amount")}</span>
            ),
        },
        {
            accessorKey: "date",
            header: "DATE",
        },
        {
            accessorKey: "paymentMethod",
            header: "PAYMENT METHOD",
        },
    ]

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

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
                                        type="text"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-32"
                                    />
                                </div>

                                {/* To Date */}
                                <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">To Date</span>
                                    <Input
                                        type="text"
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
                                    <p className="text-3xl font-bold text-primary">₹450000</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Total expenses</p>
                                    <p className="text-3xl font-bold text-destructive">₹0</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Net profit</p>
                                    <p className="text-3xl font-bold text-green-600">₹450000</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-2">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Total orders</p>
                                    <p className="text-3xl font-bold text-primary">45</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search */}
                        <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 max-w-md ml-auto">
                            <Search size={20} className="text-muted-foreground" />
                            <Input
                                placeholder="Search by category, description, or payee"
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
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        type="text"
                                        value={expenseDate}
                                        onChange={(e) => setExpenseDate(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="utilities">Utilities</SelectItem>
                                            <SelectItem value="supplies">Supplies</SelectItem>
                                            <SelectItem value="salaries">Salaries</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="rent">Rent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Expense Description */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Expense Description</label>
                                    <Input
                                        placeholder="Enter description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount</label>
                                    <Input
                                        type="text"
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
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank Transfer</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Paid To */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Paid To</label>
                                    <Input
                                        placeholder="Enter recipient"
                                        value={paidTo}
                                        onChange={(e) => setPaidTo(e.target.value)}
                                        className="rounded-xl"
                                    />
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
