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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useOutlet } from "../context/OutletContext"
import { inventoryService } from "../services"

interface StockItem {
    item: string
    category: string
    price: string
    threshold: number
    availableStock: number
}

interface StockHistory {
    item: string
    category: string
    date: string
    quantity: number
}

export const InventoryManagement = () => {
    const { outletId } = useOutlet()

    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")

    const [stockData, setStockData] = useState<StockItem[]>([])
    const [historyData, setHistoryData] = useState<StockHistory[]>([])

    const [loading, setLoading] = useState(false)

    const [fromDate, setFromDate] = useState("15-01-2026")
    const [toDate, setToDate] = useState("26-01-2026")

    useEffect(() => {
        if (outletId) {
            setLoading(true) // Start loading only when outletId is present
            fetchData()
        } else {
            setLoading(false)
        }
    }, [outletId])

    const fetchData = async () => {
        if (!outletId) return

        try {
            setLoading(true)
            const [stocksRes, historyRes] = await Promise.all([
                inventoryService.getStocks(outletId),
                inventoryService.getStockHistory(outletId)
            ])
            setStockData(stocksRes.data || [])
            setHistoryData(historyRes.data || [])
        } catch (error) {
            console.error('Error fetching inventory data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchData()
        setSearchQuery("")
        setCategoryFilter("all")
    }

    // Stock Availability Columns
    const stockColumns: ColumnDef<StockItem>[] = [
        {
            accessorKey: "item",
            header: "ITEM",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("item")}</span>
            ),
        },
        {
            accessorKey: "category",
            header: "CATEGORY",
        },
        {
            accessorKey: "price",
            header: "PRICE",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("price")}</span>
            ),
        },
        {
            accessorKey: "threshold",
            header: "THRESHOLD",
        },
        {
            accessorKey: "availableStock",
            header: "AVAILABLE STOCK",
            cell: ({ row }) => {
                const stock = row.getValue("availableStock") as number
                const threshold = row.original.threshold
                const isLow = stock <= threshold
                return (
                    <span className={isLow ? "text-destructive font-semibold" : "font-medium"}>
                        {stock}
                    </span>
                )
            },
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: () => (
                <div className="flex gap-2">
                    <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700">
                        Add
                    </Button>
                    <Button size="sm" variant="destructive" className="rounded-full">
                        Delete
                    </Button>
                </div>
            ),
        },
    ]

    // Stock History Columns
    const historyColumns: ColumnDef<StockHistory>[] = [
        {
            accessorKey: "item",
            header: "ITEM",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("item")}</span>
            ),
        },
        {
            accessorKey: "category",
            header: "CATEGORY",
        },
        {
            accessorKey: "date",
            header: "DATE",
        },
        {
            accessorKey: "quantity",
            header: "QUANTITY",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("quantity")}</span>
            ),
        },
    ]

    const filteredStockData = stockData.filter(item => {
        const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
        return matchesSearch && matchesCategory
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
            {/* Tabs Container */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="availability" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="availability">Stock Availability</TabsTrigger>
                        <TabsTrigger value="history">Stock History</TabsTrigger>
                    </TabsList>

                    {/* Stock Availability Tab */}
                    <TabsContent value="availability" className="space-y-6">
                        {/* Filters and Search */}
                        <div className="flex items-center gap-4">
                            {/* Category Filter */}
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md">
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[180px] border-0 focus:ring-0">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Starters">Starters</SelectItem>
                                        <SelectItem value="Meals">Meals</SelectItem>
                                        <SelectItem value="Desserts">Desserts</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search */}
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 flex-1 max-w-md">
                                <Search size={20} className="text-muted-foreground" />
                                <Input
                                    placeholder="Search item"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                />
                            </div>

                            {/* Refresh Button */}
                            <Button
                                onClick={handleRefresh}
                                className="rounded-full px-6 shadow-md"
                            >
                                <RefreshCw size={18} className="mr-2" />
                                Refresh
                            </Button>
                        </div>

                        {/* Current Stock Status */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Current Stock Status</h3>
                            <DataTable columns={stockColumns} data={filteredStockData} />
                        </div>
                    </TabsContent>

                    {/* Stock History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        {/* Date Filters */}
                        <div className="flex items-center gap-4">
                            {/* From Date */}
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">From Date</span>
                                <Input
                                    type="text"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-32"
                                />
                            </div>

                            {/* To Date */}
                            <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">To Date</span>
                                <Input
                                    type="text"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent w-32"
                                />
                            </div>

                            {/* Apply Button */}
                            <Button className="rounded-full px-6 shadow-md">
                                Apply
                            </Button>

                            {/* Clear Button */}
                            <Button variant="outline" className="rounded-full px-6 shadow-md">
                                Clear
                            </Button>
                        </div>

                        {/* Stock History Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Stock History</h3>
                            <DataTable columns={historyColumns} data={historyData} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
