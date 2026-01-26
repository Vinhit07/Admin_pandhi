import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

export const ReportsAnalytics = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-muted-foreground">View insights and generate reports</p>
                </div>
                <Button>Generate Report</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardDescription>Revenue This Month</CardDescription>
                        <CardTitle className="text-3xl">$45,678</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Total Orders</CardDescription>
                        <CardTitle className="text-3xl">1,234</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">+8% increase</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Avg Order Value</CardDescription>
                        <CardTitle className="text-3xl">$37.50</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">+3% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Customer Growth</CardDescription>
                        <CardTitle className="text-3xl">+234</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">New customers</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Analytics</CardTitle>
                        <CardDescription>Revenue trends and patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Sales chart will be displayed here</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Analytics</CardTitle>
                        <CardDescription>Customer behavior insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Customer analytics will be displayed here</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
