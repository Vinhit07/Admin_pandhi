import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { reportService } from "../services"
import { Loader2 } from "lucide-react"

export const Home = () => {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>(null)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const response = await reportService.getDashboardOverview()
            setDashboardData(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`

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
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-3xl text-primary">
                            {formatCurrency(dashboardData?.totalRevenue || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.revenueGrowth || '+0'}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Active Orders</CardDescription>
                        <CardTitle className="text-3xl text-secondary">
                            {dashboardData?.activeOrders || 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            +{dashboardData?.newOrdersToday || 0} new today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Customers</CardDescription>
                        <CardTitle className="text-3xl">
                            {dashboardData?.totalCustomers || 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            +{dashboardData?.newCustomersThisWeek || 0} this week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Avg. Order Value</CardDescription>
                        <CardTitle className="text-3xl">
                            {formatCurrency(dashboardData?.avgOrderValue || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            {dashboardData?.avgOrderGrowth || '+0'}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Server</span>
                            <Badge>Online</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Database</span>
                            <Badge>Healthy</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {dashboardData?.recentOrdersCount || 0} new orders in the last hour
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {dashboardData?.pendingTickets || 0} tickets awaiting response
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
