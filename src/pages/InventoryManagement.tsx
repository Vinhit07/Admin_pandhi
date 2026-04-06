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
import { RefreshCw, Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useOutlet } from "../context/OutletContext"
import { useAuth } from "../context/AuthContext"
import { inventoryService } from "../services"
import { toast } from "react-hot-toast"
// import { formatDateDDMMYYYY } from "../lib/dateUtils"
import { StockActionDialog } from "../components/dialogs/StockActionDialog"

interface StockItem {
    id?: number
    name: string
    category: string
    price: number
    threshold: number
    quantity: number
}

/*
interface StockHistory {
    name: string
    category: string
    timestamp: string
    quantity: number
    product?: {
        name: string
        category: string
    }
}
*/

export const InventoryManagement = () => {
    const { outletId, outlets, selectOutlet, loading: outletLoading } = useOutlet()
    const { user } = useAuth()

    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")

    const [stockData, setStockData] = useState<StockItem[]>([])
    // const [historyData, setHistoryData] = useState<StockHistory[]>([])

    const [loading, setLoading] = useState(false)


    // Enforce specific outlet for SuperAdmin on this page
    useEffect(() => {
        if (user?.role === 'SUPERADMIN' && (!outletId || outletId === 'ALL') && outlets.length > 0) {
            selectOutlet(outlets[0].id)
        }
    }, [outletId, outlets, user, selectOutlet])

    // Initialize with YYYY-MM-DD format
    // const [fromDate, setFromDate] = useState(() => {
    //     const d = new Date()
    //     d.setDate(d.getDate() - 30)
    //     return d.toISOString().split('T')[0]
    // })
    // const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])

    useEffect(() => {
        // If context is loading, wait
        if (outletLoading) return;

        // Prevent initial fetch for SuperAdmin if outletId is 'ALL' or undefined (Wait for Enforcement)
        if (user?.role === 'SUPERADMIN' && (!outletId || outletId === 'ALL')) return;

        // Fetch initially or when outletId changes
        fetchData()
    }, [outletId, user, outletLoading])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Use "ALL" if outletId is null
            const targetOutletId = outletId || "ALL"

            // 1. Fetch Current Stock
            const stockRes = await inventoryService.getStocks(targetOutletId)
            console.log("📦 Raw Stock Response:", stockRes)

            // FIX: Robust check for data array
            // It handles if stockRes is the array, or if stockRes.data is the array
            let finalStockData: StockItem[] = []

            if (Array.isArray(stockRes)) {
                finalStockData = stockRes
            } else if (stockRes?.data && Array.isArray(stockRes.data)) {
                finalStockData = stockRes.data
            } else if ((stockRes as any)?.products && Array.isArray((stockRes as any).products)) {
                // Fallback if key is named 'products'
                finalStockData = (stockRes as any).products
            }

            console.log("✅ Setting Stock Data to:", finalStockData)
            setStockData(finalStockData)


            // 2. Fetch History (Commented out)
            /* 
            const start = new Date(fromDate)
            const end = new Date(toDate)
            // Adjust end date to include the full day
            end.setHours(23, 59, 59, 999)

            const historyRes = await inventoryService.getStockHistory(targetOutletId, start, end)
            console.log("📊 Stock History Response:", historyRes)

            // Similar robust check for history data
            let finalHistoryData: StockHistory[] = []
            if (Array.isArray(historyRes)) {
                finalHistoryData = historyRes
            } else if (historyRes?.data && Array.isArray(historyRes.data)) {
                finalHistoryData = historyRes.data
            }

            setHistoryData(finalHistoryData)
            */

        } catch (error) {
            console.error('❌ Error fetching inventory data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchData()
        setSearchQuery("")
        setCategoryFilter("all")
    }

    // --- COLUMNS DEFINITION ---

    // --- ACTIONS ---
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
    const [actionType, setActionType] = useState<'ADD' | 'DEDUCT'>('ADD')
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleOpenDialog = (item: StockItem, type: 'ADD' | 'DEDUCT') => {
        setSelectedItem(item)
        setActionType(type)
        setIsDialogOpen(true)
    }

    const handleStockAction = async (quantity: number) => {
        if (!outletId || !selectedItem) return

        try {
            if (actionType === 'ADD') {
                await inventoryService.addStock({
                    productId: selectedItem.id, // Ensure your StockItem has ID
                    outletId, // From context (string or number?)
                    addedQuantity: quantity
                })
                toast.success("Stock added successfully")
            } else {
                await inventoryService.deductStock({
                    productId: selectedItem.id,
                    outletId,
                    quantity: quantity
                })
                toast.success("Stock deducted successfully")
            }
            fetchData() // Refresh
        } catch (error: any) {
            toast.error(error?.message || "Failed to update stock")
        }
    }

    const stockColumns: ColumnDef<StockItem>[] = [
        {
            accessorKey: "name",
            header: "ITEM",
            cell: ({ row }) => (
                <span className="font-medium capitalize">{row.getValue("name")}</span>
            ),
        },
        {
            accessorKey: "category",
            header: "CATEGORY",
            cell: ({ row }) => (
                <span className="capitalize">{row.getValue("category")}</span>
            ),
        },
        {
            accessorKey: "price",
            header: "PRICE",
            cell: ({ row }) => (
                <span className="font-semibold">₹{row.getValue("price")}</span>
            ),
        },
        {
            accessorKey: "threshold",
            header: "THRESHOLD",
        },
        {
            accessorKey: "quantity",
            header: "AVAILABLE STOCK",
            cell: ({ row }) => {
                const stock = row.getValue("quantity") as number
                const threshold = row.original.threshold || 0
                const isLow = stock <= threshold
                return (
                    <span className={isLow ? "text-red-600 font-bold" : "font-medium text-green-600"}>
                        {stock} {isLow && "(Low)"}
                    </span>
                )
            },
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleOpenDialog(row.original, 'ADD')}
                        className="rounded-full bg-green-600 hover:bg-green-700 h-8"
                    >
                        Add
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleOpenDialog(row.original, 'DEDUCT')}
                        className="rounded-full h-8"
                    >
                        Deduct
                    </Button>
                </div>
            ),
        },
    ]

    /*
    const historyColumns: ColumnDef<StockHistory>[] = [
        {
            id: "itemName",
            // Access nested data safely or fallback
            accessorFn: (row) => row.product?.name || row.name || "Unknown",
            header: "ITEM",
            cell: ({ row }) => (
                <span className="font-medium capitalize">{row.getValue("itemName")}</span>
            ),
        },
        {
            id: "category",
            accessorFn: (row) => row.product?.category || row.category || "-",
            header: "CATEGORY",
        },
        {
            accessorKey: "timestamp",
            header: "DATE",
            cell: ({ row }) => {
                const dateVal = row.getValue("timestamp") as string
                return <span className="font-medium">{dateVal ? formatDateDDMMYYYY(dateVal) : "-"}</span>
            },
        },
        {
            accessorKey: "quantity",
            header: "QUANTITY CHANGE",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("quantity")}</span>
            ),
        },
    ]
    */

    // --- FILTERING LOGIC ---

    const filteredStockData = stockData.filter(item => {
        // Safe access (?.): if item.name is undefined, use ""
        const itemName = item?.name?.toLowerCase() ?? ""
        const query = searchQuery.toLowerCase()
        const matchesSearch = itemName.includes(query)

        const itemCategory = item?.category ?? "Uncategorized"
        const matchesCategory = categoryFilter === "all" || itemCategory === categoryFilter

        return matchesSearch && matchesCategory
    })

    if (loading && stockData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Management</h1>
                <p className="text-muted-foreground">Monitor stock levels and manage inventory items</p>
            </div>

            {/* Removed the heavy outer container and kept the Tabs structure flat */}
            <div className="w-full space-y-6">

                {/* === STOCK AVAILABILITY === */}
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Category Filter */}
                    <div className="bg-card rounded-xl shadow-sm border border-border/50 min-w-[200px]">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full border-0 focus:ring-0 h-11 px-4">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Beverages">Beverages</SelectItem>
                                <SelectItem value="SpecialFoods">Special Foods</SelectItem>
                                <SelectItem value="Meals">Meals</SelectItem>
                                <SelectItem value="Starters">Starters</SelectItem>
                                <SelectItem value="Desserts">Desserts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 flex-1 h-11 px-4">
                        <Search size={18} className="text-muted-foreground shrink-0" />
                        <Input
                            placeholder="Search item..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full"
                        />
                    </div>

                    {/* Refresh Button */}
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        className="rounded-xl h-11 px-6 shadow-sm border-border/50"
                    >
                        <RefreshCw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable columns={stockColumns} data={filteredStockData} />

                {/* Empty State Message */}
                {!loading && filteredStockData.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No stock items found. Try adjusting filters or refreshing.
                    </div>
                )}
            </div>

            <StockActionDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                mode={actionType}
                item={selectedItem}
                onConfirm={handleStockAction}
            />
        </div>
    )
}