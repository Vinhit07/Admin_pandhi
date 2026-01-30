import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { customerService } from "../services"
import { useOutlet } from "../context/OutletContext"

interface Customer {
    customerId: number
    walletId: number
    name: string
    year: number
    phoneNumber: string
    walletBalance: string
    totalPurchase: string
}



export const CustomerManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    const { outletId } = useOutlet()

    useEffect(() => {
        if (outletId) {
            fetchCustomers()
        }
    }, [outletId])

    const fetchCustomers = async () => {
        if (!outletId) return

        try {
            setLoading(true)
            const response = await customerService.getCustomers(outletId)
            setCustomers(response.data || [])
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

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
