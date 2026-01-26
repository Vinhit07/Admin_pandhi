import { useState } from "react"
import { Input } from "../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Download, RefreshCw, Search } from "lucide-react"

type ReportTab = "sales" | "revenue" | "profit" | "customers"

// Mock data for Sales Report
const mockSalesData = [
    { id: 1, product: "Briyani", category: "Meals", price: 110, orders: 156, revenue: 17160 },
    { id: 2, product: "Butter Milk", category: "Beverages", price: 10, orders: 234, revenue: 2340 },
    { id: 3, product: "Coffee", category: "Beverages", price: 12, orders: 189, revenue: 2268 },
    { id: 4, product: "Idly", category: "Meals", price: 20, orders: 312, revenue: 6240 },
    { id: 5, product: "Lemon Juice", category: "SpecialFoods", price: 20, orders: 98, revenue: 1960 },
    { id: 6, product: "Dosa", category: "Meals", price: 40, orders: 245, revenue: 9800 },
    { id: 7, product: "Puri", category: "Meals", price: 35, orders: 178, revenue: 6230 },
    { id: 8, product: "Tea", category: "Beverages", price: 8, orders: 423, revenue: 3384 },
]

// Mock data for Revenue Analytics
const mockRevenueData = [
    { id: 1, source: "Dine-in", category: "Direct", amount: 48000, percentage: 58, transactions: 312 },
    { id: 2, source: "Takeaway", category: "Direct", amount: 22000, percentage: 27, transactions: 189 },
    { id: 3, source: "Delivery", category: "Partner", amount: 12000, percentage: 15, transactions: 98 },
    { id: 4, source: "Zomato", category: "Partner", amount: 8500, percentage: 10, transactions: 67 },
    { id: 5, source: "Swiggy", category: "Partner", amount: 7200, percentage: 9, transactions: 54 },
]

// Mock data for Profit/Loss
const mockProfitData = [
    { id: 1, month: "January", revenue: 82000, expenses: 48000, profit: 34000, margin: 41.5 },
    { id: 2, month: "February", revenue: 78000, expenses: 45000, profit: 33000, margin: 42.3 },
    { id: 3, month: "March", revenue: 95000, expenses: 52000, profit: 43000, margin: 45.3 },
    { id: 4, month: "April", revenue: 88000, expenses: 49000, profit: 39000, margin: 44.3 },
]

// Mock data for Customer Trends
const mockCustomerData = [
    { id: 1, name: "John Doe", orders: 15, totalSpent: 4500, lastOrder: "2026-01-25", status: "Active" },
    { id: 2, name: "Jane Smith", orders: 8, totalSpent: 2400, lastOrder: "2026-01-24", status: "Active" },
    { id: 3, name: "Mike Johnson", orders: 3, totalSpent: 890, lastOrder: "2026-01-20", status: "New" },
    { id: 4, name: "Sarah Wilson", orders: 22, totalSpent: 6600, lastOrder: "2026-01-26", status: "VIP" },
    { id: 5, name: "David Brown", orders: 5, totalSpent: 1500, lastOrder: "2026-01-15", status: "Inactive" },
]

export const ReportsAnalytics = () => {
    const [activeTab, setActiveTab] = useState<ReportTab>("sales")
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedYear, setSelectedYear] = useState("2026")

    const tabs = [
        { id: "sales" as ReportTab, label: "Sales Report" },
        { id: "revenue" as ReportTab, label: "Revenue Analytics" },
        { id: "profit" as ReportTab, label: "Profit/Loss Report" },
        { id: "customers" as ReportTab, label: "Customer Trends" },
    ]

    const categories = ["All", "Meals", "Beverages", "SpecialFoods", "Desserts"]

    // Filter sales data
    const filteredSalesData = mockSalesData.filter((item) => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        const matchesSearch = item.product.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Filter revenue data
    const filteredRevenueData = mockRevenueData.filter((item) => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        const matchesSearch = item.source.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Filter customer data
    const filteredCustomerData = mockCustomerData.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "text-green-500"
            case "VIP": return "text-purple-500"
            case "New": return "text-blue-500"
            case "Inactive": return "text-red-500"
            default: return "text-muted-foreground"
        }
    }

    const downloadCSV = () => {
        let dataToExport: any[] = []
        let filename = "report"

        switch (activeTab) {
            case "sales":
                dataToExport = filteredSalesData
                filename = "sales_report"
                break
            case "revenue":
                dataToExport = filteredRevenueData
                filename = "revenue_analytics"
                break
            case "profit":
                dataToExport = mockProfitData
                filename = "profit_loss_report"
                break
            case "customers":
                dataToExport = filteredCustomerData
                filename = "customer_trends"
                break
        }

        if (dataToExport.length === 0) return

        const headers = Object.keys(dataToExport[0]).join(",")
        const csvContent = [
            headers,
            ...dataToExport.map(row => Object.values(row).join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", `${filename}.csv`)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">Reports and Analytics</h1>
                <button
                    onClick={downloadCSV}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                >
                    <Download className="w-4 h-4" />
                    Download Report
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4 flex-wrap">
                {activeTab !== "profit" && (
                    <>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[150px] bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 text-foreground rounded-xl">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat === "All" ? "All Categories" : cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search item"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl border-border"
                            />
                        </div>
                    </>
                )}

                {activeTab === "profit" && (
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px] bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 text-foreground rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                <button className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 bg-card border border-border text-foreground hover:bg-muted transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Sales Report Table */}
            {activeTab === "sales" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Current Sales Status</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalesData.map((item) => (
                                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.product}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                                        <td className="px-6 py-4 text-green-500 font-medium">₹{item.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.orders}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{item.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
                                                    View
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                                                    Export
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing 1 to {filteredSalesData.length} of {filteredSalesData.length} results</span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">«</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">‹</button>
                            <span className="px-3 py-1.5 text-sm text-foreground">Page 1 of 1</span>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">›</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">»</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Analytics Table */}
            {activeTab === "revenue" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Revenue by Source</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Percentage</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Transactions</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRevenueData.map((item) => (
                                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.source}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{item.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-blue-500">{item.percentage}%</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.transactions}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
                                                    Details
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                                                    Export
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing 1 to {filteredRevenueData.length} of {filteredRevenueData.length} results</span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">«</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">‹</button>
                            <span className="px-3 py-1.5 text-sm text-foreground">Page 1 of 1</span>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">›</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">»</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profit/Loss Report Table */}
            {activeTab === "profit" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Profit/Loss Trends - {selectedYear}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Expenses</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Profit/Loss</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Margin</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockProfitData.map((item) => (
                                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.month}</td>
                                        <td className="px-6 py-4 text-green-500 font-medium">₹{item.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-red-500 font-medium">₹{item.expenses.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{item.profit.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-blue-500">{item.margin}%</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
                                                    Details
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                                                    Export
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing 1 to {mockProfitData.length} of {mockProfitData.length} results</span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">«</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">‹</button>
                            <span className="px-3 py-1.5 text-sm text-foreground">Page 1 of 1</span>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">›</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">»</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Trends Table */}
            {activeTab === "customers" && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground">Customer Overview</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Last Order</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-pink-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomerData.map((item) => (
                                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.orders}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{item.totalSpent.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.lastOrder}</td>
                                        <td className={`px-6 py-4 font-medium ${getStatusColor(item.status)}`}>{item.status}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
                                                    View
                                                </button>
                                                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                                                    History
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing 1 to {filteredCustomerData.length} of {filteredCustomerData.length} results</span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">«</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">‹</button>
                            <span className="px-3 py-1.5 text-sm text-foreground">Page 1 of 1</span>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">›</button>
                            <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">»</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
