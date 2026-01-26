import { useState } from "react"
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
import { RefreshCw, Search } from "lucide-react"
import { DataTable } from "../components/ui/data-table"

interface Order {
    id: string
    name: string
    orderItems: string
    status: "delivered" | "cancelled" | "partially delivered"
    totalAmount: string
    orderType: string
    orderDate: string
    deliveryDate: string
}

const mockOrders: Order[] = [
    { id: "#051", name: "Test", orderItems: "peri peri chicken roll", status: "cancelled", totalAmount: "₹90.00", orderType: "App", orderDate: "05/01/2026", deliveryDate: "15/01/2026" },
    { id: "#050", name: "Test", orderItems: "peri peri chicken roll", status: "cancelled", totalAmount: "₹90.00", orderType: "App", orderDate: "07/01/2026", deliveryDate: "07/01/2026" },
    { id: "#049", name: "Test", orderItems: "chicken biryani", status: "cancelled", totalAmount: "₹200.00", orderType: "App", orderDate: "06/01/2026", deliveryDate: "06/01/2026" },
    { id: "#048", name: "Test", orderItems: "chicken biryani, +2", status: "partially delivered", totalAmount: "₹274.50", orderType: "App", orderDate: "06/01/2026", deliveryDate: "06/01/2026" },
    { id: "#047", name: "Test", orderItems: "extra chapathi, peri peri chicken roll", status: "delivered", totalAmount: "₹105.00", orderType: "App", orderDate: "06/01/2026", deliveryDate: "06/01/2026" },
    { id: "#046", name: "Pavan", orderItems: "peri peri chicken roll", status: "cancelled", totalAmount: "₹270.00", orderType: "App", orderDate: "30/12/2025", deliveryDate: "01/01/2026" },
    { id: "#045", name: "Pavan", orderItems: "chicken biryani", status: "cancelled", totalAmount: "₹180.00", orderType: "App", orderDate: "30/12/2025", deliveryDate: "01/01/2026" },
    { id: "#044", name: "Sharon Adhitya", orderItems: "chicken biryani", status: "cancelled", totalAmount: "₹90.00", orderType: "App", orderDate: "22/12/2025", deliveryDate: "22/12/2025" },
    { id: "#043", name: "John Doe", orderItems: "mutton biryani", status: "delivered", totalAmount: "₹350.00", orderType: "App", orderDate: "20/12/2025", deliveryDate: "20/12/2025" },
    { id: "#042", name: "Jane Smith", orderItems: "veg biryani", status: "delivered", totalAmount: "₹150.00", orderType: "App", orderDate: "19/12/2025", deliveryDate: "19/12/2025" },
    { id: "#041", name: "Mike Johnson", orderItems: "chicken 65", status: "partially delivered", totalAmount: "₹180.00", orderType: "App", orderDate: "18/12/2025", deliveryDate: "18/12/2025" },
    { id: "#040", name: "Sarah Williams", orderItems: "paneer tikka", status: "delivered", totalAmount: "₹220.00", orderType: "App", orderDate: "17/12/2025", deliveryDate: "17/12/2025" },
    { id: "#039", name: "Tom Brown", orderItems: "fish fry", status: "cancelled", totalAmount: "₹280.00", orderType: "App", orderDate: "16/12/2025", deliveryDate: "16/12/2025" },
    { id: "#038", name: "Alice Cooper", orderItems: "egg curry", status: "delivered", totalAmount: "₹120.00", orderType: "App", orderDate: "15/12/2025", deliveryDate: "15/12/2025" },
    { id: "#037", name: "Bob Martin", orderItems: "dal tadka", status: "delivered", totalAmount: "₹100.00", orderType: "App", orderDate: "14/12/2025", deliveryDate: "14/12/2025" },
]

const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
        "delivered": { variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-100" },
        "cancelled": { variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-100" },
        "partially delivered": { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" }
    }
    const config = variants[status] || variants["delivered"]
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>
}

export const OrderManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [orders, setOrders] = useState(mockOrders)

    const handleRefresh = () => {
        setOrders([...mockOrders])
        setSearchQuery("")
        setStatusFilter("all")
    }

    // Define columns for the data table
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "id",
            header: "ORDER ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("id")}</span>
            ),
        },
        {
            accessorKey: "name",
            header: "NAME",
        },
        {
            accessorKey: "orderItems",
            header: "ORDER ITEMS",
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
                <span className="font-semibold">{row.getValue("totalAmount")}</span>
            ),
        },
        {
            accessorKey: "orderType",
            header: "ORDER TYPE",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {row.getValue("orderType")}
                </Badge>
            ),
        },
        {
            accessorKey: "orderDate",
            header: "ORDER DATE",
        },
        {
            accessorKey: "deliveryDate",
            header: "DELIVERY DATE",
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: () => (
                <Button size="sm" className="rounded-full">
                    View
                </Button>
            ),
        },
    ]

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header */}


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
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="partially delivered">Partially Delivered</SelectItem>
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
        </div>
    )
}
