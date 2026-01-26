import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

export const ProductManagement = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
                    <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                <Button>Add Product</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Products</CardDescription>
                        <CardTitle className="text-3xl">456</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">In catalog</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Active Products</CardDescription>
                        <CardTitle className="text-3xl">423</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Available for sale</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Out of Stock</CardDescription>
                        <CardTitle className="text-3xl text-destructive">12</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Needs restocking</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Categories</CardDescription>
                        <CardTitle className="text-3xl">15</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Product types</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Catalog</CardTitle>
                    <CardDescription>View and manage all products</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Product list will be displayed here</p>
                </CardContent>
            </Card>
        </div>
    )
}
