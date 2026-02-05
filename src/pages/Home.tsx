import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { reportService } from "../services"
import { Loader2, Calendar } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from "recharts"
import type { AnalyticsParams } from "../types/api"

export const Home = () => {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    })

    // Analytics data states
    const [revenueTrend, setRevenueTrend] = useState<any[]>([])
    const [orderStatusDist, setOrderStatusDist] = useState<any>(null)
    const [orderSourceDist, setOrderSourceDist] = useState<any>(null)
    const [topSellingItems, setTopSellingItems] = useState<any[]>([])
    const [peakTimeSlots, setPeakTimeSlots] = useState<any[]>([])

    useEffect(() => {
        fetchAllData()
    }, [dateRange])

    const fetchAllData = async () => {
        try {
            setLoading(true)
            // Backend expects 'from' and 'to', not 'startDate' and 'endDate'
            const params = {
                from: dateRange.from,
                to: dateRange.to
            }

            console.log('📊 Fetching dashboard data with params:', params)

            // Fetch all analytics data
            const [overview, revenue, orderStatus, orderSource, topItems, peakSlots] = await Promise.all([
                reportService.getDashboardOverview(params as any),
                reportService.getRevenueTrend(params as any),
                reportService.getOrderStatusDistribution(params as any),
                reportService.getOrderSourceDistribution(params as any),
                reportService.getTopSellingItems(params as any),
                reportService.getPeakTimeSlots(params as any)
            ])

            console.log('📈 API Responses received:')
            console.log('  - Overview:', overview)
            console.log('  - Revenue Trend:', revenue)
            console.log('  - Order Status:', orderStatus)
            console.log('  - Order Source:', orderSource)
            console.log('  - Top Items:', topItems)
            console.log('  - Peak Slots:', peakSlots)

            // Overview endpoint returns {success, data, message} but others return data directly
            // This is an inconsistency in the backend API
            const overviewData = (overview as any)?.data ? (overview as any).data : overview

            setDashboardData(overviewData)
            setRevenueTrend(Array.isArray(revenue) ? revenue : [])
            setOrderStatusDist(orderStatus)
            setOrderSourceDist(orderSource)
            setTopSellingItems(Array.isArray(topItems) ? topItems : [])
            setPeakTimeSlots(Array.isArray(peakSlots) ? peakSlots : [])

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => `₹${amount?.toLocaleString() || 0}`

    const setQuickDateRange = (days: number) => {
        const to = new Date().toISOString().split('T')[0]
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        setDateRange({ from, to })
    }

    // Prepare pie chart data for Order Status
    const getOrderStatusPieData = () => {
        if (!orderStatusDist) return []
        return [
            { name: 'Delivered', value: orderStatusDist.delivered || 0, color: '#10b981' },
            { name: 'Pending', value: orderStatusDist.pending || 0, color: '#f59e0b' },
            { name: 'Cancelled', value: orderStatusDist.cancelled || 0, color: '#ef4444' },
            { name: 'Partially Delivered', value: orderStatusDist.partiallyDelivered || 0, color: '#3b82f6' }
        ].filter(item => item.value > 0)
    }

    // Prepare pie chart data for Order Source
    const getOrderSourcePieData = () => {
        if (!orderSourceDist) return []
        return [
            { name: 'App Orders', value: orderSourceDist.appOrders || 0, color: '#8b5cf6' },
            { name: 'Manual Orders', value: orderSourceDist.manualOrders || 0, color: '#ec4899' }
        ].filter(item => item.value > 0)
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
            <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive overview of your business metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active Stores</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {dashboardData?.totalActiveOutlets || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-3xl text-primary">
                            {formatCurrency(dashboardData?.totalRevenue || 0)}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Customers</CardDescription>
                        <CardTitle className="text-3xl text-purple-600">
                            {dashboardData?.totalCustomers || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Orders</CardDescription>
                        <CardTitle className="text-3xl text-orange-600">
                            {dashboardData?.totalOrders || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Top Performing Store</CardDescription>
                        <CardTitle className="text-xl text-cyan-600">
                            {dashboardData?.topPerformingOutlet?.name || 'N/A'}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <span className="font-semibold">Date Range:</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setQuickDateRange(7)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                >
                                    7 Days
                                </button>
                                <button
                                    onClick={() => setQuickDateRange(30)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                >
                                    30 Days
                                </button>
                                <button
                                    onClick={() => setQuickDateRange(90)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                >
                                    90 Days
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <span className="text-muted-foreground">to</span>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    {revenueTrend.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-muted-foreground">
                            No revenue trend data available for the selected period
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Distribution of order statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {getOrderStatusPieData().length > 0 ? (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getOrderStatusPieData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getOrderStatusPieData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-muted-foreground">
                                No order status data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Source Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Source</CardTitle>
                        <CardDescription>App vs Manual orders distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {getOrderSourcePieData().length > 0 ? (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getOrderSourcePieData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getOrderSourcePieData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-muted-foreground">
                                No order source data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Selling Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Items</CardTitle>
                        <CardDescription>Best performing products</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topSellingItems.length > 0 ? (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topSellingItems} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="productName"
                                            angle={-45}
                                            textAnchor="end"
                                            tick={{ fontSize: 12 }}
                                            height={80}
                                            interval={0}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="totalOrders" fill="#10b981" name="Total Orders" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-muted-foreground">
                                No top selling items data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Peak Time Slots */}
                <Card>
                    <CardHeader>
                        <CardTitle>Peak Time Slots</CardTitle>
                        <CardDescription>Order distribution by delivery time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {peakTimeSlots.length > 0 ? (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={peakTimeSlots} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="displayName"
                                            angle={-45}
                                            textAnchor="end"
                                            tick={{ fontSize: 12 }}
                                            height={80}
                                            interval={0}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="orderCount" fill="#f59e0b" name="Order Count" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-muted-foreground">
                                No peak time slots data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
