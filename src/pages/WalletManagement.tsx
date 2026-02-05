import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { RefreshCw, Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useOutlet } from "../context/OutletContext"
import { walletService } from "../services"

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

export const WalletManagement = () => {
    const { outletId } = useOutlet()

    const [searchQuery, setSearchQuery] = useState("")
    const [walletData, setWalletData] = useState<WalletSummary[]>([])
    const [rechargeData, setRechargeData] = useState<RechargeHistory[]>([])
    const [paidOrdersData, setPaidOrdersData] = useState<PaidOrder[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (outletId) {
            setLoading(true)
            fetchData()
        } else {
            setLoading(false)
        }
    }, [outletId])

    const fetchData = async () => {
        if (!outletId) return

        try {
            setLoading(true)
            const [walletRes, rechargeRes, ordersRes] = await Promise.all([
                walletService.getWalletHistory(outletId), // Note: Verify endpoint mapping 
                walletService.getRechargeHistory(outletId),
                walletService.getOrdersPaidViaWallet(outletId)
            ])
            setWalletData(walletRes.data || [])
            setRechargeData(rechargeRes.data || [])
            setPaidOrdersData(ordersRes.data || [])
        } catch (error) {
            console.error('Error fetching wallet data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchData()
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

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
