import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { customerService } from "../services"
import { useOutlet } from "../context/OutletContext"
import { CustomerDetailsDialog } from "../components/dialogs/CustomerDetailsDialog"

// 1. Fixed Interface to match API response exactly
interface Customer {
    customerId: number
    walletId: number
    name: string
    yearOfStudy: number     // Changed from 'year'
    phoneNo: string         // Changed from 'phoneNumber'
    email: string
    walletBalance: number
    totalPurchaseCost: number
    totalOrders: number     // Changed from 'orderCount'
    lastOrderDate: string | null
}

export const CustomerManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { outletId } = useOutlet()

    useEffect(() => {
        // Fetch initially or when outletId changes (including when it's null/'ALL')
        fetchCustomers()
    }, [outletId])

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const targetOutletId = outletId || "ALL"
            const response = await customerService.getCustomers(targetOutletId)
            console.log("👥 Raw Response:", response)

            // 2. Fixed Data Extraction Logic
            // The log shows data is inside response.data.customers
            let customerData: Customer[] = []

            // Check if response has data property which has customers
            if ((response as any)?.data?.customers && Array.isArray((response as any).data.customers)) {
                customerData = (response as any).data.customers
            } else if ((response as any)?.customers && Array.isArray((response as any).customers)) {
                // Fallback if service returns the data object directly
                customerData = (response as any).customers
            } else if (Array.isArray(response)) {
                // Fallback if response itself is array
                customerData = response as any
            } else if ((response as any).data && Array.isArray((response as any).data)) {
                // Generic data array
                customerData = (response as any).data
            }

            console.log("✅ Set Customers:", customerData)
            setCustomers(customerData)

        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer({
            id: customer.customerId,
            walletId: customer.walletId,
            name: customer.name,
            email: customer.email || "N/A",
            walletBalance: customer.walletBalance,
            totalOrders: customer.totalOrders, // Updated key
            totalPurchase: customer.totalPurchaseCost, // Updated key
            lastOrderDate: customer.lastOrderDate || "N/A"
        })
        setIsDialogOpen(true)
    }

    // 3. Updated Columns to use correct accessor keys
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
                <span className="font-medium text-primary capitalize">{row.getValue("name")}</span>
            ),
        },
        {
            accessorKey: "walletBalance",
            header: "WALLET BALANCE",
            cell: ({ row }) => (
                <span className="font-semibold">₹{Number(row.getValue("walletBalance") || 0).toFixed(2)}</span>
            ),
        },
        {
            accessorKey: "totalPurchaseCost", // Fixed key
            header: "TOTAL PURCHASE",
            cell: ({ row }) => (
                <span className="font-semibold">₹{Number(row.getValue("totalPurchaseCost") || 0).toFixed(2)}</span>
            ),
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleViewCustomer(row.original)}
                >
                    View
                </Button>
            ),
        },
    ]

    // 4. Updated Filter Logic
    const filteredCustomers = customers.filter(customer =>
        (customer.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (customer.phoneNo || "").includes(searchQuery) ||
        (customer.customerId?.toString() || "").includes(searchQuery)
    )

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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Customer Management</h1>
                <p className="text-muted-foreground">View and manage customer information</p>
            </div>

            {/* Search */}
            {/* Search - Pill shaped */}
            <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 flex-1 max-w-md h-11 px-4">
                <Search size={18} className="text-muted-foreground shrink-0" />
                <Input
                    placeholder="Search by ID or Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full"
                />
            </div>

            {/* Customer Details Table */}
            <DataTable columns={customerColumns} data={filteredCustomers} />

            {!loading && filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No customers found.
                </div>
            )}

            {/* Customer Details Dialog */}
            <CustomerDetailsDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                customer={selectedCustomer}
            />
        </div>
    )
}