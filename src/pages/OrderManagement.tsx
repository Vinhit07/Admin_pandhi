import { useState, useEffect, useMemo } from "react"
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
import { Badge } from "../components/ui/badge"
import { RefreshCw, Search, Loader2, ShoppingBag, BarChart3 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { useOutlet } from "../context/OutletContext"
import { orderService } from "../services"
import { OrderDetailsDialog } from "../components/dialogs/OrderDetailsDialog"

interface OrderItem {
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface Order {
    orderId: number
    customerName: string
    customerPhone: string
    items: OrderItem[]
    status: string
    totalAmount: number
    type: string
    orderTime: string
    deliveryDate: string
    deliverySlot: string
    paymentMethod: string
}

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
        "PENDING": { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
        "DELIVERED": { variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-100" },
        "CANCELLED": { variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-100" },
        "PARTIALLY_DELIVERED": { variant: "secondary", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" }
    }
    const config = statusMap[status] || statusMap["PENDING"]
    return <Badge variant={config.variant} className={config.className}>{status.toLowerCase()}</Badge>
}

export const OrderManagement = () => {
    const { outletId } = useOutlet()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Tab state: "orders" or "analytics"
    const [activeTab, setActiveTab] = useState<"orders" | "analytics">("orders")
    // Product filter for analytics tab
    const [selectedProduct, setSelectedProduct] = useState<string>("all")

    useEffect(() => {
        // Fetch initially or when outletId changes (including when it's null/'ALL')
        setLoading(true)
        fetchOrders()
    }, [outletId])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const targetOutletId = outletId || "ALL"
            const response = await orderService.getOrders(targetOutletId)
            setOrders(response.data || [])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchOrders()
        setSearchQuery("")
        setStatusFilter("all")
        setSelectedProduct("all")
    }

    const handleViewOrder = (order: Order) => {
        setSelectedOrder({
            orderId: order.orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            status: order.status,
            deliveryDate: order.deliveryDate,
            deliverySlot: order.deliverySlot,
            type: order.type,
            paymentMethod: order.paymentMethod,
            items: order.items,
            totalAmount: order.totalAmount
        })
        setIsDialogOpen(true)
    }

    // Extract unique product names from all orders
    const uniqueProducts = useMemo(() => {
        const productSet = new Set<string>()
        orders.forEach(order => {
            order.items?.forEach(item => {
                if (item.productName) {
                    productSet.add(item.productName)
                }
            })
        })
        return Array.from(productSet).sort()
    }, [orders])

    // Product analytics data
    const productAnalytics = useMemo(() => {
        if (selectedProduct === "all") {
            // Show analytics for ALL products
            const productMap = new Map<string, { totalQuantity: number, orderCount: number, totalRevenue: number }>()
            orders.forEach(order => {
                order.items?.forEach(item => {
                    if (item.productName) {
                        const existing = productMap.get(item.productName) || { totalQuantity: 0, orderCount: 0, totalRevenue: 0 }
                        existing.totalQuantity += item.quantity
                        existing.totalRevenue += item.totalPrice || (item.unitPrice * item.quantity)
                        productMap.set(item.productName, existing)
                    }
                })
            })
            // Count unique orders per product
            orders.forEach(order => {
                const seenProducts = new Set<string>()
                order.items?.forEach(item => {
                    if (item.productName && !seenProducts.has(item.productName)) {
                        seenProducts.add(item.productName)
                        const existing = productMap.get(item.productName)!
                        existing.orderCount += 1
                    }
                })
            })
            return Array.from(productMap.entries()).map(([name, data]) => ({
                productName: name,
                ...data
            })).sort((a, b) => b.totalQuantity - a.totalQuantity)
        }
        return []
    }, [orders, selectedProduct])

    // Filter orders that contain the selected product
    const productFilteredOrders = useMemo(() => {
        if (selectedProduct === "all") return orders
        return orders.filter(order =>
            order.items?.some(item =>
                item.productName?.toLowerCase() === selectedProduct.toLowerCase()
            )
        )
    }, [orders, selectedProduct])

    // Grand total quantity of the selected product
    const grandTotalQuantity = useMemo(() => {
        if (selectedProduct === "all") {
            return orders.reduce((total, order) =>
                total + (order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0)
                , 0)
        }
        return productFilteredOrders.reduce((total, order) => {
            const matchingItems = order.items?.filter(item =>
                item.productName?.toLowerCase() === selectedProduct.toLowerCase()
            ) || []
            return total + matchingItems.reduce((sum, item) => sum + item.quantity, 0)
        }, 0)
    }, [orders, productFilteredOrders, selectedProduct])

    // Grand total revenue of the selected product
    const grandTotalRevenue = useMemo(() => {
        if (selectedProduct === "all") {
            return orders.reduce((total, order) =>
                total + (order.items?.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0) || 0)
                , 0)
        }
        return productFilteredOrders.reduce((total, order) => {
            const matchingItems = order.items?.filter(item =>
                item.productName?.toLowerCase() === selectedProduct.toLowerCase()
            ) || []
            return total + matchingItems.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0)
        }, 0)
    }, [orders, productFilteredOrders, selectedProduct])

    // Define columns for the data table (Orders tab)
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "orderId",
            header: "ORDER ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("orderId")}</span>
            ),
        },
        {
            accessorKey: "customerName",
            header: "NAME",
        },
        {
            accessorKey: "items",
            header: "ORDER ITEMS",
            cell: ({ row }) => {
                const items = row.getValue("items") as OrderItem[]
                const itemNames = items?.map(item => item.productName).join(", ") || "N/A"
                return <span className="text-sm">{itemNames}</span>
            }
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
        },
        {
            accessorKey: "totalAmount",
            header: "TOTAL AMOUNT",
            cell: ({ row }) => (
                <span className="font-semibold">₹{Number(row.getValue("totalAmount")).toFixed(2)}</span>
            ),
        },
        {
            accessorKey: "type",
            header: "ORDER TYPE",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                const isManual = type === "MANUAL";
                return (
                    <Badge
                        variant="outline"
                        className={isManual
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"}
                    >
                        {type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "orderTime",
            header: "ORDER DATE",
            cell: ({ row }) => (
                <span>{formatDate(row.getValue("orderTime"))}</span>
            ),
        },
        {
            accessorKey: "deliveryDate",
            header: "DELIVERY DATE",
            cell: ({ row }) => (
                <span>{formatDate(row.getValue("deliveryDate"))}</span>
            ),
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleViewOrder(row.original)}
                >
                    View
                </Button>
            ),
        },
    ]

    // Columns for the product-filtered orders table (Analytics tab with specific product selected)
    const productOrderColumns: ColumnDef<Order>[] = [
        {
            accessorKey: "orderId",
            header: "ORDER ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("orderId")}</span>
            ),
        },
        {
            accessorKey: "customerName",
            header: "NAME",
        },
        {
            id: "productQty",
            header: "QTY OF PRODUCT",
            cell: ({ row }) => {
                const items = row.original.items || []
                const matchingItems = items.filter(item =>
                    item.productName?.toLowerCase() === selectedProduct.toLowerCase()
                )
                const qty = matchingItems.reduce((sum, item) => sum + item.quantity, 0)
                return <span className="font-semibold text-primary">{qty}</span>
            }
        },
        {
            id: "productTotal",
            header: "PRODUCT TOTAL",
            cell: ({ row }) => {
                const items = row.original.items || []
                const matchingItems = items.filter(item =>
                    item.productName?.toLowerCase() === selectedProduct.toLowerCase()
                )
                const total = matchingItems.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0)
                return <span className="font-semibold">₹{total.toFixed(2)}</span>
            }
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
        },
        {
            accessorKey: "orderTime",
            header: "ORDER DATE",
            cell: ({ row }) => (
                <span>{formatDate(row.getValue("orderTime"))}</span>
            ),
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleViewOrder(row.original)}
                >
                    View
                </Button>
            ),
        },
    ]

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            String(order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customerPhone || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Order Management</h1>
                <p className="text-muted-foreground">Monitor and process incoming orders</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === "orders"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card text-muted-foreground border border-border/50 hover:bg-accent hover:text-accent-foreground"
                        }`}
                >
                    <ShoppingBag size={16} />
                    Orders
                </button>
                <button
                    onClick={() => setActiveTab("analytics")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === "analytics"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card text-muted-foreground border border-border/50 hover:bg-accent hover:text-accent-foreground"
                        }`}
                >
                    <BarChart3 size={16} />
                    Product Analytics
                </button>
            </div>

            {/* =================== ORDERS TAB =================== */}
            {activeTab === "orders" && (
                <>
                    {/* Filters and Search */}
                    <div className="flex items-center gap-4">
                        <div className="bg-card rounded-xl shadow-sm border border-border/50">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px] border-0 focus:ring-0 h-11 px-4">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    <SelectItem value="PARTIALLY_DELIVERED">Partially Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 flex-1 max-w-md h-11 px-4">
                            <Search size={18} className="text-muted-foreground shrink-0" />
                            <Input
                                placeholder="Search by ID or Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full"
                            />
                        </div>

                        <Button
                            onClick={handleRefresh}
                            className="rounded-xl h-11 px-6 shadow-sm border border-border/10"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                    </div>

                    <DataTable columns={columns} data={filteredOrders} />
                </>
            )}

            {/* =================== PRODUCT ANALYTICS TAB =================== */}
            {activeTab === "analytics" && (
                <>
                    {/* Product Filter */}
                    <div className="flex items-center gap-4">
                        <div className="bg-card rounded-xl shadow-sm border border-border/50">
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger className="w-[260px] border-0 focus:ring-0 h-11 px-4">
                                    <SelectValue placeholder="Select Product" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    {uniqueProducts.map((product) => (
                                        <SelectItem key={product} value={product}>
                                            {product}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleRefresh}
                            className="rounded-xl h-11 px-6 shadow-sm border border-border/10"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                {selectedProduct === "all" ? "Total Items Ordered" : `Total "${selectedProduct}" Ordered`}
                            </p>
                            <p className="text-3xl font-bold text-primary">{grandTotalQuantity}</p>
                            <p className="text-xs text-muted-foreground mt-1">across {productFilteredOrders.length} order(s)</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Orders Containing Product
                            </p>
                            <p className="text-3xl font-bold text-foreground">{productFilteredOrders.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">out of {orders.length} total order(s)</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Product Revenue
                            </p>
                            <p className="text-3xl font-bold text-green-500">₹{grandTotalRevenue.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedProduct === "all" ? "all products combined" : `from "${selectedProduct}"`}
                            </p>
                        </div>
                    </div>

                    {/* Product Breakdown Table (when "All Products" selected) */}
                    {selectedProduct === "all" && productAnalytics.length > 0 && (
                        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border/50">
                                <h3 className="text-sm font-semibold text-foreground">Product-wise Breakdown</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <th className="text-left px-5 py-3">#</th>
                                            <th className="text-left px-5 py-3">Product Name</th>
                                            <th className="text-center px-5 py-3">Total Quantity</th>
                                            <th className="text-center px-5 py-3">Orders</th>
                                            <th className="text-right px-5 py-3">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productAnalytics.map((item, index) => (
                                            <tr
                                                key={item.productName}
                                                className="border-b border-border/30 hover:bg-accent/50 cursor-pointer transition-colors"
                                                onClick={() => setSelectedProduct(item.productName)}
                                            >
                                                <td className="px-5 py-3 text-sm text-muted-foreground">{index + 1}</td>
                                                <td className="px-5 py-3">
                                                    <span className="font-medium text-foreground">{item.productName}</span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                                                        {item.totalQuantity}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center text-sm text-muted-foreground">{item.orderCount}</td>
                                                <td className="px-5 py-3 text-right font-semibold text-green-500">₹{item.totalRevenue.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Filtered Orders Table (when specific product selected) */}
                    {selectedProduct !== "all" && (
                        <>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Orders with "{selectedProduct}"
                                </h3>
                                <button
                                    onClick={() => setSelectedProduct("all")}
                                    className="text-xs text-primary hover:underline ml-2"
                                >
                                    ← Back to all products
                                </button>
                            </div>
                            <DataTable columns={productOrderColumns} data={productFilteredOrders} />
                        </>
                    )}
                </>
            )}

            {/* Order Details Dialog */}
            <OrderDetailsDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                order={selectedOrder}
            />
        </div>
    )
}

