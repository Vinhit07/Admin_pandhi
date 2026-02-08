import { useState, useEffect } from "react"
import { formatDate } from "../lib/dateUtils"
import { Input } from "../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Download, RefreshCw, Search, Loader2 } from "lucide-react"
import { useOutlet } from "../context/OutletContext"
import { reportService } from "../services"
import type { AnalyticsParams } from "../types/api"

type ReportTab = "sales" | "revenue" | "profit" | "customers"

export const ReportsAnalytics = () => {
    const { outletId } = useOutlet()

    const [activeTab, setActiveTab] = useState<ReportTab>("sales")
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedYear, setSelectedYear] = useState("2026")

    const [salesData, setSalesData] = useState<any[]>([])
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [profitData, setProfitData] = useState<any[]>([])
    const [customerData, setCustomerData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const tabs = [
        { id: "sales" as ReportTab, label: "Sales Report" },
        { id: "revenue" as ReportTab, label: "Revenue Analytics" },
        { id: "profit" as ReportTab, label: "Profit/Loss Report" },
        { id: "customers" as ReportTab, label: "Customer Trends" },
    ]

    const categories = ["All", "Meals", "Beverages", "SpecialFoods", "Desserts"]

    useEffect(() => {
        if (outletId) {
            fetchData()
        }
    }, [outletId, activeTab, selectedYear]) // Added selectedYear to dependencies

    const fetchData = async () => {
        if (!outletId) return

        try {
            setLoading(true)
            const params: AnalyticsParams = {
                from: `${selectedYear}-01-01`,
                to: `${selectedYear}-12-31`,
            }

            // Fetch data based on active tab
            switch (activeTab) {
                case "sales":
                    const salesRes = await reportService.getSalesReport(outletId, params)
                    // Fix: Handle array response directly (API returns [{},{},...])
                    if (Array.isArray(salesRes)) {
                        setSalesData(salesRes)
                    } else if (salesRes?.data && Array.isArray(salesRes.data)) {
                        setSalesData(salesRes.data)
                    } else {
                        setSalesData([])
                    }
                    break

                case "revenue":
                    const revenueRes = await reportService.getRevenueSplit(outletId, params)
                    // Check for nested data or direct object
                    const revenueRaw = (revenueRes as any).data || revenueRes

                    if (revenueRaw) {
                        const total = revenueRaw.totalRevenue || 0
                        const revenueArray = [
                            {
                                source: "App Orders",
                                category: "Online",
                                amount: revenueRaw.revenueByAppOrder || 0,
                                percentage: total > 0 ? ((revenueRaw.revenueByAppOrder / total) * 100).toFixed(1) : 0,
                                transactions: 0
                            },
                            {
                                source: "Manual Orders",
                                category: "Offline",
                                amount: revenueRaw.revenueByManualOrder || 0,
                                percentage: total > 0 ? ((revenueRaw.revenueByManualOrder / total) * 100).toFixed(1) : 0,
                                transactions: 0
                            },
                            {
                                source: "Wallet Recharge",
                                category: "Digital Wallet",
                                amount: revenueRaw.revenueByWalletRecharge || 0,
                                percentage: total > 0 ? ((revenueRaw.revenueByWalletRecharge / total) * 100).toFixed(1) : 0,
                                transactions: 0
                            }
                        ]
                        setRevenueData(revenueArray)
                    }
                    break

                case "profit":
                    // Profit/loss endpoint requires year instead of from/to
                    const profitParams = { year: parseInt(selectedYear) }
                    const profitRes = await reportService.getProfitLossTrends(outletId, profitParams)

                    // Fix: Handle array response directly
                    if (Array.isArray(profitRes)) {
                        setProfitData(profitRes)
                    } else if (profitRes?.data && Array.isArray(profitRes.data)) {
                        setProfitData(profitRes.data)
                    } else {
                        setProfitData([])
                    }
                    break

                case "customers":
                    const customerRes = await reportService.getCustomerOverview(outletId, params)
                    const customerRaw = (customerRes as any).data || customerRes

                    if (customerRaw) {
                        const customerArray = [
                            {
                                name: "New Customers",
                                customerName: "New Customers",
                                orders: customerRaw.newCustomers || 0,
                                totalSpent: 0,
                                lastOrder: "-",
                                status: "New"
                            },
                            {
                                name: "Returning Customers",
                                customerName: "Returning Customers",
                                orders: customerRaw.returningCustomers || 0,
                                totalSpent: 0,
                                lastOrder: "-",
                                status: "Active"
                            }
                        ]
                        setCustomerData(customerArray)
                    }
                    break
            }
        } catch (error) {
            console.error("Error fetching report data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter sales data
    const filteredSalesData = salesData.filter((item) => {
        // If API doesn't return category, this will fail unless filter is "All".
        // item.category check added to prevent crashes if undefined
        const matchesCategory = categoryFilter === "All" || (item.category && item.category === categoryFilter)
        const matchesSearch = searchQuery === "" || item.productName?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Filter revenue data
    const filteredRevenueData = revenueData.filter((item) => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        const matchesSearch = item.source?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Filter customer data
    const filteredCustomerData = customerData.filter((item) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
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
                dataToExport = profitData
                filename = "profit_loss_report"
                break
            case "customers":
                dataToExport = filteredCustomerData
                filename = "customer_trends"
                break
        }

        if (dataToExport.length === 0) {
            alert("No data to export")
            return
        }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
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
                {activeTab === "sales" && (
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

                <button
                    onClick={fetchData}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 bg-card border border-border text-foreground hover:bg-muted transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Sales Table */}
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalesData.length > 0 ? filteredSalesData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.productName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.category || 'N/A'}</td>
                                        <td className="px-6 py-4 text-green-500 font-medium">₹{item.quantity > 0 ? (item.revenue / item.quantity).toFixed(2) : '0.00'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.totalOrders || 0}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{(item.revenue || 0).toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No sales data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing {filteredSalesData.length} results</span>
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRevenueData.length > 0 ? filteredRevenueData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.source || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.category || 'N/A'}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{(item.amount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-blue-500">{item.percentage || 0}%</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.transactions || 0}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No revenue data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing {filteredRevenueData.length} results</span>
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
                                </tr>
                            </thead>
                            <tbody>
                                {profitData.length > 0 ? profitData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.month || 'N/A'}</td>
                                        <td className="px-6 py-4 text-green-500 font-medium">₹{(item.revenue || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-red-500 font-medium">₹{(item.expenses || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{(item.profit || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-blue-500">{item.margin || 0}%</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No profit/loss data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing {profitData.length} results</span>
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomerData.length > 0 ? filteredCustomerData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 text-foreground">{item.name || item.customerName || 'N/A'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.orders || item.totalOrders || 0}</td>
                                        <td className="px-6 py-4 text-green-500 font-semibold">₹{(item.totalSpent || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.lastOrder ? formatDate(item.lastOrder) : 'N/A'}</td>
                                        <td className={`px-6 py-4 font-medium ${getStatusColor(item.status || 'Active')}`}>{item.status || 'Active'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No customer data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-green-500">Showing {filteredCustomerData.length} results</span>
                    </div>
                </div>
            )}
        </div>
    )
}