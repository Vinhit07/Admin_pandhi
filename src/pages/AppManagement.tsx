import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

export const AppManagement = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">App Management</h1>
                    <p className="text-muted-foreground">Configure application settings</p>
                </div>
                <Button>Save Settings</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure basic app settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">General configuration options</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage security and authentication</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Security configuration options</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Gateway</CardTitle>
                        <CardDescription>Configure payment settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Payment integration settings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Email Configuration</CardTitle>
                        <CardDescription>Setup email notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Email service settings</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
