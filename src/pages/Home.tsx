import { useState, useEffect } from "react"
import { useOutlet } from "../context/OutletContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { reportService } from "../services"
import { formatDateDDMMYYYY } from "../lib/dateUtils"
import { Loader2, RefreshCw } from "lucide-react"
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
import { useAuth } from "../context/AuthContext"

export const Home = () => {
    const { outletId } = useOutlet()
    const { user } = useAuth()
    const isSuperAdmin = user?.role === 'SUPERADMIN'

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
        // Wait for outletId to be initialized (it might be null briefly)
        if (outletId === undefined) return;

        fetchAllData()
    }, [dateRange, outletId])

    const fetchAllData = async () => {
        try {
            setLoading(true)
            const params: any = {
                from: dateRange.from,
                to: dateRange.to
            }

            if (outletId && outletId !== 'ALL') {
                params.outletId = Number(outletId);
            }

            console.log('📊 Fetching dashboard data with params:', params)

            const [overview, revenue, orderStatus, orderSource, topItems, peakSlots] = await Promise.all([
                reportService.getDashboardOverview(params),
                reportService.getRevenueTrend(params),
                reportService.getOrderStatusDistribution(params),
                reportService.getOrderSourceDistribution(params),
                reportService.getTopSellingItems(params),
                reportService.getPeakTimeSlots(params)
            ])

            const overviewData = (overview as any)?.data ? (overview as any).data : overview

            setDashboardData(overviewData)
            const sortedRevenue = Array.isArray(revenue)
                ? revenue.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                : []
            setRevenueTrend(sortedRevenue)
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

    const getOrderStatusPieData = () => {
        if (!orderStatusDist) return []
        return [
            { name: 'Delivered', value: orderStatusDist.delivered || 0, color: '#10b981' },
            { name: 'Pending', value: orderStatusDist.pending || 0, color: '#f59e0b' },
            { name: 'Cancelled', value: orderStatusDist.cancelled || 0, color: '#ef4444' },
            { name: 'Partially Delivered', value: orderStatusDist.partiallyDelivered || 0, color: '#3b82f6' }
        ].filter(item => item.value > 0)
    }

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
        <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Comprehensive overview of business metrics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                        {[
                            { label: "7 Days", val: 7 },
                            { label: "30 Days", val: 30 },
                            { label: "90 Days", val: 90 }
                        ].map(q => {
                            const isCurrentRange = Math.round((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (24 * 60 * 60 * 1000)) === q.val;
                            return (
                                <button
                                    key={q.val}
                                    onClick={() => setQuickDateRange(q.val)}
                                    className={`
                                        px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200
                                        ${isCurrentRange
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }
                                    `}
                                >
                                    {q.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="bg-transparent text-sm outline-none border-none p-0 w-[110px]"
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="bg-transparent text-sm outline-none border-none p-0 w-[110px]"
                        />
                    </div>

                    <button
                        onClick={fetchAllData}
                        className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {isSuperAdmin && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Active Vendors</CardDescription>
                            <CardTitle className="text-3xl text-green-600">
                                {dashboardData?.totalActiveOutlets || 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                )}

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

                {isSuperAdmin && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Top Performing Vendor</CardDescription>
                            <CardTitle className="text-xl text-cyan-600">
                                {dashboardData?.topPerformingOutlet?.name || 'N/A'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                )}
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    {revenueTrend.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(val) => formatDateDDMMYYYY(val)}
                                    />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Order Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Distribution of order statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {getOrderStatusPieData().length > 0 ? (
                            <div className="h-[300px] w-full">
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
                            <div className="h-[300px] w-full">
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
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topSellingItems} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="productName"
                                            tick={{ fontSize: 11 }}
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
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={peakTimeSlots} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="displayName"
                                            tick={{ fontSize: 11 }}
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
