import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { RefreshCw, Search } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

interface WalletSummary {
    walletId: string
    customerName: string
    walletBalance: string
    totalRecharged: string
    totalUsed: string
    lastRecharge: string
    lastOrder: string
}

interface RechargeHistory {
    rechargeId: string
    customerName: string
    amount: string
    date: string
    paymentMethod: string
    status: "RECHARGE" | "DEDUCT"
}

interface PaidOrder {
    orderId: string
    customerName: string
    amount: string
    date: string
    paymentStatus: string
}

const mockWalletSummary: WalletSummary[] = [
    { walletId: "#W2027", customerName: "Test", walletBalance: "₹0.00", totalRecharged: "₹0.00", totalUsed: "₹0.00", lastRecharge: "N/A", lastOrder: "N/A" },
    { walletId: "#W2026", customerName: "Indu", walletBalance: "₹0.00", totalRecharged: "₹0.00", totalUsed: "₹0.00", lastRecharge: "N/A", lastOrder: "N/A" },
    { walletId: "#W2000", customerName: "Test", walletBalance: "₹4835.91", totalRecharged: "₹6050.00", totalUsed: "₹2352.41", lastRecharge: "20/01/2026", lastOrder: "09/01/2026" },
    { walletId: "#W2024", customerName: "Pavan", walletBalance: "₹320.00", totalRecharged: "₹500.00", totalUsed: "₹180.00", lastRecharge: "30/12/2025", lastOrder: "30/12/2025" },
    { walletId: "#W2020", customerName: "Pavan", walletBalance: "₹500.00", totalRecharged: "₹500.00", totalUsed: "₹0.00", lastRecharge: "20/12/2025", lastOrder: "N/A" },
    { walletId: "#W2018", customerName: "Arjun M", walletBalance: "₹0.00", totalRecharged: "₹0.00", totalUsed: "₹0.00", lastRecharge: "N/A", lastOrder: "N/A" },
    { walletId: "#W2017", customerName: "GOPIKUL J", walletBalance: "₹0.00", totalRecharged: "₹0.00", totalUsed: "₹0.00", lastRecharge: "N/A", lastOrder: "N/A" },
    { walletId: "#W2005", customerName: "Latha Ilanchelan", walletBalance: "₹67.64", totalRecharged: "₹200.00", totalUsed: "₹422.29", lastRecharge: "20/12/2025", lastOrder: "20/12/2025" },
]

const mockRechargeHistory: RechargeHistory[] = [
    { rechargeId: "#RC1011", customerName: "Test", amount: "₹500.00", date: "03/12/2025", paymentMethod: "UPI", status: "RECHARGE" },
    { rechargeId: "#RC1010", customerName: "Test", amount: "₹1000.00", date: "04/12/2025", paymentMethod: "UPI", status: "RECHARGE" },
    { rechargeId: "#RC1005", customerName: "Test", amount: "₹-180.00", date: "04/12/2025", paymentMethod: "WALLET", status: "DEDUCT" },
    { rechargeId: "#RC1004", customerName: "Test", amount: "₹-180.00", date: "04/12/2025", paymentMethod: "WALLET", status: "DEDUCT" },
    { rechargeId: "#RC1003", customerName: "Test", amount: "₹500.00", date: "06/12/2025", paymentMethod: "UPI", status: "RECHARGE" },
    { rechargeId: "#RC1006", customerName: "Test", amount: "₹-270.00", date: "09/12/2025", paymentMethod: "WALLET", status: "DEDUCT" },
    { rechargeId: "#RC1007", customerName: "Test", amount: "₹270.00", date: "09/12/2025", paymentMethod: "WALLET", status: "RECHARGE" },
]

const mockPaidOrders: PaidOrder[] = [
    { orderId: "#ORD051", customerName: "Test", amount: "₹90.00", date: "09/01/2026", paymentStatus: "Wallet Paid" },
    { orderId: "#ORD050", customerName: "Test", amount: "₹90.00", date: "07/01/2026", paymentStatus: "Wallet Paid" },
    { orderId: "#ORD048", customerName: "Test", amount: "₹274.50", date: "08/01/2026", paymentStatus: "Wallet Paid" },
    { orderId: "#ORD047", customerName: "Test", amount: "₹105.00", date: "08/01/2026", paymentStatus: "Wallet Paid" },
    { orderId: "#ORD045", customerName: "Pavan", amount: "₹180.00", date: "30/12/2025", paymentStatus: "Wallet Paid" },
    { orderId: "#ORD044", customerName: "Sharon Adhitya", amount: "₹90.00", date: "22/12/2025", paymentStatus: "Wallet Paid" },
    { orderId: "#ORD043", customerName: "Latha Ilanchelan", amount: "₹112.49", date: "20/12/2025", paymentStatus: "Wallet Paid" },
]

export const WalletManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [walletData] = useState(mockWalletSummary)
    const [rechargeData] = useState(mockRechargeHistory)
    const [paidOrdersData] = useState(mockPaidOrders)

    const handleRefresh = () => {
        setSearchQuery("")
    }

    // Wallet Summary Columns
    const walletColumns: ColumnDef<WalletSummary>[] = [
        {
            accessorKey: "walletId",
            header: "WALLET ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("walletId")}</span>
            ),
        },
        {
            accessorKey: "customerName",
            header: "CUSTOMER NAME",
        },
        {
            accessorKey: "walletBalance",
            header: "WALLET BALANCE",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("walletBalance")}</span>
            ),
        },
        {
            accessorKey: "totalRecharged",
            header: "TOTAL RECHARGED",
        },
        {
            accessorKey: "totalUsed",
            header: "TOTAL USED",
        },
        {
            accessorKey: "lastRecharge",
            header: "LAST RECHARGE",
        },
        {
            accessorKey: "lastOrder",
            header: "LAST ORDER",
        },
    ]

    // Recharge History Columns
    const rechargeColumns: ColumnDef<RechargeHistory>[] = [
        {
            accessorKey: "rechargeId",
            header: "RECHARGE ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("rechargeId")}</span>
            ),
        },
        {
            accessorKey: "customerName",
            header: "CUSTOMER NAME",
        },
        {
            accessorKey: "amount",
            header: "AMOUNT",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("amount")}</span>
            ),
        },
        {
            accessorKey: "date",
            header: "DATE",
        },
        {
            accessorKey: "paymentMethod",
            header: "PAYMENT METHOD",
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge
                        variant={status === "RECHARGE" ? "default" : "destructive"}
                        className={status === "RECHARGE" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                    >
                        {status}
                    </Badge>
                )
            },
        },
    ]

    // Paid Orders Columns
    const paidOrdersColumns: ColumnDef<PaidOrder>[] = [
        {
            accessorKey: "orderId",
            header: "ORDER ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("orderId")}</span>
            ),
        },
        {
            accessorKey: "customerName",
            header: "CUSTOMER NAME",
        },
        {
            accessorKey: "amount",
            header: "AMOUNT",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("amount")}</span>
            ),
        },
        {
            accessorKey: "date",
            header: "DATE",
        },
        {
            accessorKey: "paymentStatus",
            header: "PAYMENT STATUS",
            cell: ({ row }) => (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {row.getValue("paymentStatus")}
                </Badge>
            ),
        },
    ]

    const filteredWalletData = walletData.filter(wallet =>
        wallet.walletId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredRechargeData = rechargeData.filter(recharge =>
        recharge.rechargeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recharge.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredPaidOrders = paidOrdersData.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Tabs Container */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
                        <TabsTrigger value="summary">Wallet Summary</TabsTrigger>
                        <TabsTrigger value="history">Recharge History</TabsTrigger>
                        <TabsTrigger value="orders">Paid orders</TabsTrigger>
                    </TabsList>

                    {/* Wallet Summary Tab */}
                    <TabsContent value="summary" className="space-y-6">
                        {/* Search and Refresh */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 flex-1 max-w-md">
                                <Search size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Search by Wallet ID or Name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                            <Button onClick={handleRefresh} className="rounded-full px-6 shadow-md">
                                <RefreshCw size={18} className="mr-2" />
                                Refresh
                            </Button>
                        </div>

                        {/* Wallet Summary Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Wallet Summary</h3>
                            <DataTable columns={walletColumns} data={filteredWalletData} />
                        </div>
                    </TabsContent>

                    {/* Recharge History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        {/* Search and Refresh */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 flex-1 max-w-md">
                                <Search size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Search by Recharge ID or Name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                            <Button onClick={handleRefresh} className="rounded-full px-6 shadow-md">
                                <RefreshCw size={18} className="mr-2" />
                                Refresh
                            </Button>
                        </div>

                        {/* Recharge History Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Recharge History</h3>
                            <DataTable columns={rechargeColumns} data={filteredRechargeData} />
                        </div>
                    </TabsContent>

                    {/* Paid Orders Tab */}
                    <TabsContent value="orders" className="space-y-6">
                        {/* Search and Refresh */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 flex-1 max-w-md">
                                <Search size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Search by Order ID or Name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>
                            <Button onClick={handleRefresh} className="rounded-full px-6 shadow-md">
                                <RefreshCw size={18} className="mr-2" />
                                Refresh
                            </Button>
                        </div>

                        {/* Paid Orders Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Paid Orders</h3>
                            <DataTable columns={paidOrdersColumns} data={filteredPaidOrders} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
