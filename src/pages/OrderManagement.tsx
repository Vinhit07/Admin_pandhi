import { useState, useEffect } from "react"
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
import { RefreshCw, Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { useOutlet } from "../context/OutletContext"
import { orderService } from "../services"
import { OrderDetailsDialog } from "../components/dialogs/OrderDetailsDialog"

interface OrderItem {
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface Order {
    orderId: number
    customerName: string
    customerPhone: string
    orderItems: OrderItem[]
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

    useEffect(() => {
        if (outletId) {
            setLoading(true)
            fetchOrders()
        } else {
            setLoading(false)
        }
    }, [outletId])

    const fetchOrders = async () => {
        if (!outletId) return

        try {
            setLoading(true)
            const response = await orderService.getOrders(outletId)
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
            items: order.orderItems,
            totalAmount: order.totalAmount
        })
        setIsDialogOpen(true)
    }

    // Define columns for the data table
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
            accessorKey: "orderItems",
            header: "ORDER ITEMS",
            cell: ({ row }) => {
                const items = row.getValue("orderItems") as OrderItem[]
                const itemNames = items?.map(item => item.name).join(", ") || "N/A"
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
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {row.getValue("type")}
                </Badge>
            ),
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
            {/* Filters and Search - Pill shaped */}
            <div className="flex items-center gap-4">
                {/* Status Filter */}
                <div className="bg-sidebar border-2 border-sidebar-border rounded-full px-4 py-2 shadow-md">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] border-0 focus:ring-0">
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

                {/* Search - Pill shaped */}
                <div className="bg-sidebar border-2 border-sidebar-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 flex-1 max-w-md">
                    <Search size={20} className="text-muted-foreground" />
                    <Input
                        placeholder="Search by ID or Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                </div>

                {/* Refresh Button - Pill shaped */}
                <Button
                    onClick={handleRefresh}
                    className="rounded-full px-6 shadow-md"
                >
                    <RefreshCw size={18} className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Data Table - Pill shaped container */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <DataTable columns={columns} data={filteredOrders} />
            </div>

            {/* Order Details Dialog */}
            <OrderDetailsDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                order={selectedOrder}
            />
        </div>
    )
}
