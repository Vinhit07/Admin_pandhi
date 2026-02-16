import { useState, useEffect } from "react"
import { formatDate } from "../lib/dateUtils"
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
    console.log("Rendered WalletManagement. outletId:", outletId) // DEBUG
    const [searchQuery, setSearchQuery] = useState("")
    const [walletData, setWalletData] = useState<WalletSummary[]>([])
    const [rechargeData, setRechargeData] = useState<RechargeHistory[]>([])
    const [paidOrdersData, setPaidOrdersData] = useState<PaidOrder[]>([])
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("summary")

    useEffect(() => {
        // Fetch initially or when outletId changes (including when it's null/'ALL')
        setLoading(true)
        fetchData()
    }, [outletId])

    const fetchData = async () => {
        // Allow fallback to ALL if null. If it's "ALL" string, use 0 for integer-expecting APIs if needed, 
        // or keep as "ALL" if service handles it. 
        // Based on previous code: `outletId === 'ALL' ? 0 : outletId` for some services.
        // Wallet service seems to expect number for some, string for others? 
        // Let's look at the signatures inferred from usage:
        // getWalletHistory(number), getRechargeHistory(number), getOrdersPaidViaWallet(string | number)

        const targetId = outletId || "ALL"

        try {
            setLoading(true)
            const [walletRes, rechargeRes, ordersRes] = await Promise.all([
                walletService.getWalletHistory(targetId),
                walletService.getRechargeHistory(targetId),
                walletService.getOrdersPaidViaWallet(targetId)
            ])
            console.log("Wallet Data Response:", walletRes)
            console.log("Recharge Data Response:", rechargeRes)
            console.log("Orders Data Response:", ordersRes)

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
            accessorKey: "name",
            header: "CUSTOMER NAME",
        },
        {
            accessorKey: "balance",
            header: "WALLET BALANCE",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("balance")}</span>
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
            accessorKey: "lastRecharged",
            header: "LAST RECHARGE",
            cell: ({ row }) => (
                <span className="font-semibold">{formatDate(row.getValue("lastRecharged"))}</span>
            ),
        },
        {
            accessorKey: "lastOrder",
            header: "LAST ORDER",
            cell: ({ row }) => (
                <span className="font-semibold">{formatDate(row.getValue("lastOrder"))}</span>
            ),
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
            cell: ({ row }) => (
                <span className="font-semibold">{formatDate(row.getValue("date"))}</span>
            ),
        },
        {
            accessorKey: "method",
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
            accessorKey: "orderTotal",
            header: "AMOUNT",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("orderTotal")}</span>
            ),
        },
        {
            accessorKey: "orderDate",
            header: "DATE",
            cell: ({ row }) => (
                <span className="font-semibold">{new Date(row.getValue("orderDate")).toLocaleDateString()}</span>
            ),
        },
        {
            accessorKey: "paymentStatus",
            header: "PAYMENT STATUS",
            cell: () => (
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Completed
                </Badge>
            ),
        },
    ]

    const filteredWalletData = walletData.filter(wallet =>
        String(wallet.walletId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredRechargeData = rechargeData.filter(recharge =>
        String(recharge.rechargeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        recharge.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredPaidOrders = paidOrdersData.filter(order =>
        String(order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Wallet Management</h1>
                <p className="text-muted-foreground">Monitor and manage digital wallets and transactions</p>
            </div>

            {/* Removed the heavy outer container and kept the Tabs structure flat */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6 h-12">
                    <TabsTrigger value="summary" className="rounded-lg">Wallet Summary</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg">Recharge History</TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-lg">Paid orders</TabsTrigger>
                </TabsList>

                {/* Wallet Summary Tab */}
                <TabsContent value="summary" className="space-y-6">
                    {/* Search and Refresh */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 flex-1 max-w-md h-11 px-4">
                            <Search size={18} className="text-muted-foreground shrink-0" />
                            <Input
                                placeholder="Search by Wallet ID or Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full p-0"
                            />
                        </div>
                        <Button onClick={handleRefresh} className="rounded-xl h-11 px-6 shadow-sm border border-border/10">
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Wallet Summary Table */}
                    <DataTable columns={walletColumns} data={filteredWalletData} />
                </TabsContent>

                {/* Recharge History Tab */}
                <TabsContent value="history" className="space-y-6">
                    {/* Search and Refresh */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 flex-1 max-w-md h-11 px-4">
                            <Search size={18} className="text-muted-foreground shrink-0" />
                            <Input
                                placeholder="Search by Recharge ID or Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full p-0"
                            />
                        </div>
                        <Button onClick={handleRefresh} className="rounded-xl h-11 px-6 shadow-sm border border-border/10">
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Recharge History Table */}
                    <DataTable columns={rechargeColumns} data={filteredRechargeData} />
                </TabsContent>

                {/* Paid Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                    {/* Search and Refresh */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 flex-1 max-w-md h-11 px-4">
                            <Search size={18} className="text-muted-foreground shrink-0" />
                            <Input
                                placeholder="Search by Order ID or Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full p-0"
                            />
                        </div>
                        <Button onClick={handleRefresh} className="rounded-xl h-11 px-6 shadow-sm border border-border/10">
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Paid Orders Table */}
                    <DataTable columns={paidOrdersColumns} data={filteredPaidOrders} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
