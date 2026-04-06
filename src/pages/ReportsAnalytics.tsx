import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { formatDate } from "../lib/dateUtils"
import { Input } from "../components/ui/input"
import { DataTable } from "../components/ui/data-table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Download, RefreshCw, Search, Loader2 } from "lucide-react"
import { useOutlet } from "../context/OutletContext"
import { useAuth } from "../context/AuthContext"
import { reportService } from "../services"
import type { AnalyticsParams } from "../types/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

type ReportTab = "sales" | "revenue" | "profit" | "customers"

// --- Types ---
interface SalesRow {
    productName: string
    category: string
    quantity: number
    revenue: number
    totalOrders: number
}

interface RevenueRow {
    source: string
    category: string
    amount: number
    percentage: string | number
    transactions: number
}

interface ProfitRow {
    month: string
    revenue: number
    sales: number
    expenses: number
    profit: number
    margin: number
}

interface CustomerRow {
    name: string
    customerName: string
    orders: number
    totalSpent: number
    lastOrder: string
    status: string
}

export const ReportsAnalytics = () => {
    const { outletId, loading: outletLoading } = useOutlet()
    const { user } = useAuth()

    const [activeTab, setActiveTab] = useState<ReportTab>("sales")
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedYear, setSelectedYear] = useState("2026")

    const [salesData, setSalesData] = useState<SalesRow[]>([])
    const [revenueData, setRevenueData] = useState<RevenueRow[]>([])
    const [profitData, setProfitData] = useState<ProfitRow[]>([])
    const [customerData, setCustomerData] = useState<CustomerRow[]>([])
    const [loading, setLoading] = useState(true)

    const tabs = [
        { id: "sales" as ReportTab, label: "Sales Report" },
        { id: "revenue" as ReportTab, label: "Revenue Analytics" },
        { id: "profit" as ReportTab, label: "Profit/Loss Report" },
        { id: "customers" as ReportTab, label: "Customer Trends" },
    ]

    const categories = ["All", "Meals", "Beverages", "SpecialFoods", "Desserts"]

    useEffect(() => {
        // Wait for outlet context to initialize
        if (outletLoading) return;

        // Fetch if outletId is present OR if it's explicitly null/undefined (meaning ALL for SuperAdmin)
        // We just need to make sure we don't fetch if authentication is still loading, 
        // but outletId itself being null is now a valid state for "All".
        fetchData()
    }, [outletId, activeTab, selectedYear, user, outletLoading])

    const fetchData = async () => {
        try {
            setLoading(true)
            const params: AnalyticsParams = {
                from: `${selectedYear}-01-01`,
                to: `${selectedYear}-12-31`,
            }

            // Use "ALL" if outletId is null
            const targetOutletId = outletId || "ALL"

            switch (activeTab) {
                case "sales":
                    const salesRes = await reportService.getSalesReport(targetOutletId, params)
                    if (Array.isArray(salesRes)) {
                        setSalesData(salesRes)
                    } else if (salesRes?.data && Array.isArray(salesRes.data)) {
                        setSalesData(salesRes.data)
                    } else {
                        setSalesData([])
                    }
                    break

                case "revenue":
                    const revenueRes = await reportService.getRevenueSplit(targetOutletId, params)
                    const revenueRaw = (revenueRes as any).data || revenueRes

                    if (revenueRaw) {
                        const total = revenueRaw.totalRevenue || 0
                        const revenueArray: RevenueRow[] = [
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
                    const profitParams = { year: parseInt(selectedYear) }
                    const profitRes = await reportService.getProfitLossTrends(targetOutletId, profitParams)

                    let rawProfitData: any[] = []
                    if (Array.isArray(profitRes)) {
                        rawProfitData = profitRes
                    } else if (profitRes?.data && Array.isArray(profitRes.data)) {
                        rawProfitData = profitRes.data
                    }

                    // Map backend fields (sales) to frontend fields (revenue) and compute margin
                    const mappedProfitData: ProfitRow[] = rawProfitData.map((row: any) => {
                        const revenue = row.sales || row.revenue || 0
                        const expenses = row.expenses || 0
                        const profit = row.profit || (revenue - expenses)
                        const margin = revenue > 0 ? parseFloat(((profit / revenue) * 100).toFixed(1)) : 0
                        return {
                            month: row.month,
                            revenue,
                            sales: revenue,
                            expenses,
                            profit,
                            margin,
                        }
                    })
                    setProfitData(mappedProfitData)
                    break

                case "customers":
                    const customerRes = await reportService.getCustomerOverview(targetOutletId, params)
                    const customerRaw = (customerRes as any).data || customerRes

                    if (customerRaw) {
                        const customerArray: CustomerRow[] = [
                            {
                                name: "New Customers",
                                customerName: "New Customers",
                                orders: customerRaw.newCustomers || 0,
                                totalSpent: customerRaw.newCustomerRevenue || 0,
                                lastOrder: "-",
                                status: "New"
                            },
                            {
                                name: "Returning Customers",
                                customerName: "Returning Customers",
                                orders: customerRaw.returningCustomers || 0,
                                totalSpent: customerRaw.returningCustomerRevenue || 0,
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

    // --- Column Definitions ---

    const salesColumns: ColumnDef<SalesRow>[] = [
        {
            accessorKey: "productName",
            header: "Product",
            cell: ({ row }) => <span className="text-foreground font-bold">{row.getValue("productName") || 'N/A'}</span>,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => <span className="text-foreground">{row.getValue("category") || 'N/A'}</span>,
        },
        {
            id: "price",
            header: "Price",
            cell: ({ row }) => {
                const qty = row.original.quantity
                const rev = row.original.revenue
                return <span className="text-green-700 font-medium">₹{qty > 0 ? (rev / qty).toFixed(2) : '0.00'}</span>
            },
        },
        {
            accessorKey: "totalOrders",
            header: "Orders",
            cell: ({ row }) => <span className="text-foreground">{row.getValue("totalOrders") || 0}</span>,
        },
        {
            accessorKey: "revenue",
            header: "Revenue",
            cell: ({ row }) => <span className="text-green-700 font-bold">₹{((row.getValue("revenue") as number) || 0).toLocaleString()}</span>,
        },
    ]

    const revenueColumns: ColumnDef<RevenueRow>[] = [
        {
            accessorKey: "source",
            header: "Source",
            cell: ({ row }) => <span className="text-foreground font-bold">{row.getValue("source") || 'N/A'}</span>,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => <span className="text-foreground">{row.getValue("category") || 'N/A'}</span>,
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => <span className="text-green-700 font-bold">₹{((row.getValue("amount") as number) || 0).toLocaleString()}</span>,
        },
        {
            accessorKey: "percentage",
            header: "Percentage",
            cell: ({ row }) => <span className="text-blue-700 font-medium">{row.getValue("percentage") || 0}%</span>,
        },
        {
            accessorKey: "transactions",
            header: "Transactions",
            cell: ({ row }) => <span className="text-foreground">{row.getValue("transactions") || 0}</span>,
        },
    ]

    const profitColumns: ColumnDef<ProfitRow>[] = [
        {
            accessorKey: "month",
            header: "Month",
            cell: ({ row }) => <span className="text-foreground font-bold">{row.getValue("month") || 'N/A'}</span>,
        },
        {
            accessorKey: "revenue",
            header: "Revenue",
            cell: ({ row }) => <span className="text-green-700 font-bold">₹{((row.getValue("revenue") as number) || 0).toLocaleString()}</span>,
        },
        {
            accessorKey: "expenses",
            header: "Expenses",
            cell: ({ row }) => <span className="text-red-500 font-medium">₹{((row.getValue("expenses") as number) || 0).toLocaleString()}</span>,
        },
        {
            accessorKey: "profit",
            header: "Profit/Loss",
            cell: ({ row }) => {
                const profit = (row.getValue("profit") as number) || 0
                return <span className={`font-bold ${profit >= 0 ? 'text-green-700' : 'text-red-500'}`}>₹{profit.toLocaleString()}</span>
            },
        },
        {
            accessorKey: "margin",
            header: "Margin",
            cell: ({ row }) => <span className="text-blue-700 font-medium">{row.getValue("margin") || 0}%</span>,
        },
    ]

    const customerColumns: ColumnDef<CustomerRow>[] = [
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => <span className="text-foreground font-bold">{row.original.name || row.original.customerName || 'N/A'}</span>,
        },
        {
            accessorKey: "orders",
            header: "Orders",
            cell: ({ row }) => <span className="text-foreground">{row.getValue("orders") || 0}</span>,
        },
        {
            accessorKey: "totalSpent",
            header: "Total Spent",
            cell: ({ row }) => <span className="text-green-700 font-bold">₹{((row.getValue("totalSpent") as number) || 0).toLocaleString()}</span>,
        },
        {
            accessorKey: "lastOrder",
            header: "Last Order",
            cell: ({ row }) => {
                const val = row.getValue("lastOrder") as string
                return <span className="text-foreground">{val && val !== '-' ? formatDate(val) : 'N/A'}</span>
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = (row.getValue("status") as string) || 'Active'
                return <span className={`font-medium ${getStatusColor(status)}`}>{status}</span>
            },
        },
    ]

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

            <Tabs defaultValue="sales" onValueChange={(val) => setActiveTab(val as ReportTab)} value={activeTab} className="w-full space-y-6">
                {/* Tab Navigation */}
                <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Shared Filters Row (Outside TabsContent if common, or inside if specific) */}
                {/* In this case, filters vary by tab, so we keep them in a shared row but conditionally rendered */}
                <div className="flex items-center gap-4 flex-wrap">
                    {activeTab === "sales" && (
                        <>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px] border-0 focus:ring-0 h-11 px-4 rounded-xl shadow-sm border border-border/50">
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
                                    className="pl-10 h-11 rounded-xl border-border"
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

                {/* Data Tables wrapped in Content */}
                <TabsContent value="sales">
                    <DataTable columns={salesColumns} data={filteredSalesData} pageSize={10} />
                </TabsContent>

                <TabsContent value="revenue">
                    <DataTable columns={revenueColumns} data={filteredRevenueData} pageSize={10} />
                </TabsContent>

                <TabsContent value="profit">
                    <DataTable columns={profitColumns} data={profitData} pageSize={12} />
                </TabsContent>

                <TabsContent value="customers">
                    <DataTable columns={customerColumns} data={filteredCustomerData} pageSize={10} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
