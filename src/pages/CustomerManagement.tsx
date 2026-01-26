import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Search } from "lucide-react"
import { DataTable } from "../components/ui/data-table"

interface Customer {
    customerId: number
    walletId: number
    name: string
    year: number
    phoneNumber: string
    walletBalance: string
    totalPurchase: string
}

const mockCustomers: Customer[] = [
    { customerId: 1, walletId: 1, name: "Customer1", year: 2, phoneNumber: "8667410952", walletBalance: "₹1035.00", totalPurchase: "₹5119.50" },
    { customerId: 3, walletId: 4, name: "InAu", year: 3, phoneNumber: "9629772202", walletBalance: "₹0.00", totalPurchase: "₹0.00" },
    { customerId: 5, walletId: 6, name: "Mutesh Vijayan", year: 4, phoneNumber: "9894111808", walletBalance: "₹0.00", totalPurchase: "₹0.00" },
    { customerId: 6, walletId: 11, name: "Sharon Adhitya", year: 4, phoneNumber: "9994098046", walletBalance: "₹10.00", totalPurchase: "₹210.00" },
    { customerId: 7, walletId: 12, name: "Siveesubhan R", year: 4, phoneNumber: "7200018927", walletBalance: "₹425.00", totalPurchase: "₹165.00" },
    { customerId: 8, walletId: 14, name: "Abshayaa", year: 3, phoneNumber: "6381918926", walletBalance: "₹0.00", totalPurchase: "₹0.00" },
    { customerId: 9, walletId: 15, name: "Rakshita", year: 4, phoneNumber: "8807785350", walletBalance: "₹0.00", totalPurchase: "₹0.00" },
    { customerId: 4, walletId: 5, name: "Latha Ilanchelan", year: 1, phoneNumber: "8300114406", walletBalance: "₹67.64", totalPurchase: "₹604.19" },
    { customerId: 10, walletId: 17, name: "GOPIKUL J", year: 4, phoneNumber: "9360987266", walletBalance: "₹0.00", totalPurchase: "₹0.00" },
    { customerId: 11, walletId: 18, name: "Arjun M", year: 4, phoneNumber: "9361234567", walletBalance: "₹0.00", totalPurchase: "₹0.00" },
    { customerId: 12, walletId: 19, name: "Test User", year: 2, phoneNumber: "9876543210", walletBalance: "₹500.00", totalPurchase: "₹1500.00" },
]

export const CustomerManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [customers] = useState(mockCustomers)

    // Customer Columns
    const customerColumns: ColumnDef<Customer>[] = [
        {
            accessorKey: "customerId",
            header: "CUSTOMER ID",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("customerId")}</span>
            ),
        },
        {
            accessorKey: "walletId",
            header: "WALLET ID",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("walletId")}</span>
            ),
        },
        {
            accessorKey: "name",
            header: "NAME",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("name")}</span>
            ),
        },
        {
            accessorKey: "year",
            header: "YEAR",
        },
        {
            accessorKey: "phoneNumber",
            header: "PHONE NUMBER",
        },
        {
            accessorKey: "walletBalance",
            header: "WALLET BALANCE",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("walletBalance")}</span>
            ),
        },
        {
            accessorKey: "totalPurchase",
            header: "TOTAL PURCHASE",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("totalPurchase")}</span>
            ),
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

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phoneNumber.includes(searchQuery) ||
        customer.customerId.toString().includes(searchQuery)
    )

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="flex justify-end">
                <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 max-w-md">
                    <Search size={20} className="text-muted-foreground" />
                    <Input
                        placeholder="Search by ID or Name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                </div>
            </div>

            {/* Customer Details Table */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                <DataTable columns={customerColumns} data={filteredCustomers} />
            </div>
        </div>
    )
}
