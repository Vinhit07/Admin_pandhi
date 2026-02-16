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
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { RefreshCw, Search, Loader2 } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { useOutlet } from "../context/OutletContext"
import { ticketService } from "../services/ticketService"
import toast from "react-hot-toast"
import { formatDateDDMMYYYY } from "../lib/dateUtils"
import { TicketDetailsDialog } from "../components/dialogs/TicketDetailsDialog"
import { TicketChatDialog } from "../components/dialogs/TicketChatDialog"

// 1. Updated Interface to match API Log
interface Ticket {
    ticketId: number
    createdAt: string
    customerName: string
    customerEmail: string
    description: string
    priority: string
    status: string
    resolutionNote?: string | null
    resolvedAt?: string | null
}

export const TicketManagement = () => {
    const { outletId } = useOutlet()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isChatModalOpen, setIsChatModalOpen] = useState(false)

    useEffect(() => {
        // Fetch initially or when outletId changes (including when it's null/'ALL')
        setLoading(true)
        fetchTickets()
    }, [outletId])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const targetOutletId = outletId || "ALL"
            const response = await ticketService.getTickets(targetOutletId)
            console.log("🎫 Tickets Response:", response)

            // 2. FIXED: Removed 'response.success' check. 
            // The log shows the data is directly in response.data
            const ticketData = response.data || []

            setTickets(Array.isArray(ticketData) ? ticketData : [])

        } catch (error) {
            console.error("Error fetching tickets:", error)
            toast.error("Failed to load tickets")
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = () => {
        fetchTickets()
        setSearchQuery("")
        setStatusFilter("all")
    }

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsViewModalOpen(true)
    }

    const handleChatTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsChatModalOpen(true)
    }

    const handleResolveTicket = async (ticketId: string, resolutionNote: string) => {
        try {
            const resolvedAt = new Date().toISOString()
            const response = await ticketService.closeTicket(Number(ticketId), resolutionNote, resolvedAt)
            // Adjust this check depending on your closeTicket API response
            if (response) {
                toast.success("Ticket resolved successfully")
                fetchTickets()
                setIsChatModalOpen(false)
            }
        } catch (error: any) {
            console.error("Error resolving ticket:", error)
            // Extract error message from API response if available
            const errorMsg = error.response?.data?.message || error.message || "Failed to resolve ticket";
            toast.error(errorMsg)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { className: string }> = {
            "OPEN": { className: "bg-green-100 text-green-800 hover:bg-green-100" },
            "IN_PROGRESS": { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
            "RESOLVED": { className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
            "CLOSED": { className: "bg-red-100 text-red-800 hover:bg-red-100" }
        }
        const config = variants[status] || variants["OPEN"]
        return <Badge className={config.className}>{status}</Badge>
    }

    // 3. FIXED: Columns to match API keys (ticketId, priority, etc)
    const ticketColumns: ColumnDef<Ticket>[] = [
        {
            accessorKey: "ticketId", // Changed from 'id'
            header: "TICKET ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">#{row.getValue("ticketId")}</span>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "DATE",
            cell: ({ row }) => formatDateDDMMYYYY(row.getValue("createdAt"))
        },
        {
            accessorKey: "priority", // API has priority, not issueType
            header: "PRIORITY",
            cell: ({ row }) => (
                <span className="uppercase text-xs font-bold text-muted-foreground">
                    {row.getValue("priority")}
                </span>
            )
        },
        {
            accessorKey: "description",
            header: "DESCRIPTION",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.getValue("description")}>
                    {row.getValue("description")}
                </div>
            ),
        },
        {
            accessorKey: "customerName",
            header: "CUSTOMER",
            cell: ({ row }) => row.original.customerName || "N/A"
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => getStatusBadge(row.getValue("status")),
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleViewTicket(row.original)}
                    >
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => handleChatTicket(row.original)}
                        disabled={row.original.status === 'CLOSED'}
                    >
                        {row.original.status === 'CLOSED' ? 'Closed' : 'Resolve'}
                    </Button>
                </div>
            ),
        },
    ]

    // 4. FIXED: Filter Logic using correct keys
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.ticketId.toString().includes(searchQuery) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalTickets = tickets.length
    const openTickets = tickets.filter(t => t.status === "OPEN").length
    const closedTickets = tickets.filter(t => t.status === "CLOSED").length

    if (loading && tickets.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Ticket Management</h1>
                <p className="text-muted-foreground">Manage and resolve customer support tickets</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-xl border border-border/50 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Total tickets</p>
                        <p className="text-4xl font-bold text-primary">{totalTickets}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border/50 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Open Tickets</p>
                        <p className="text-4xl font-bold text-primary">{openTickets}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border/50 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Closed Tickets</p>
                        <p className="text-4xl font-bold text-primary">{closedTickets}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Status Filter */}
                    <div className="bg-card rounded-xl shadow-sm border border-border/50 h-11 px-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] border-0 focus:ring-0 h-full p-0">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="bg-card rounded-xl shadow-sm border border-border/50 flex items-center gap-2 max-w-md h-11 px-4">
                        <Search size={18} className="text-muted-foreground shrink-0" />
                        <Input
                            placeholder="Search by ID, description or name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full"
                        />
                    </div>

                    {/* Refresh Button */}
                    <Button onClick={handleRefresh} className="rounded-xl h-11 px-6 shadow-sm border border-border/10">
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Ticket Details Table */}
            <DataTable columns={ticketColumns} data={filteredTickets} />

            {/* Ticket Details Dialog */}
            {selectedTicket && (
                <TicketDetailsDialog
                    open={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    // 5. FIXED: Mapping API data to Dialog props
                    ticket={{
                        id: String(selectedTicket.ticketId),
                        date: formatDateDDMMYYYY(selectedTicket.createdAt),
                        description: selectedTicket.description,
                        raisedBy: selectedTicket.customerName || "N/A",
                        email: selectedTicket.customerEmail || "N/A",
                        priority: selectedTicket.priority || "MEDIUM",
                        status: selectedTicket.status
                    }}
                />
            )}

            {/* Ticket Chat/Resolve Dialog */}
            <TicketChatDialog
                open={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                ticketId={String(selectedTicket?.ticketId || "")}
                ticketDescription={selectedTicket?.description || ""}
                customerName={selectedTicket?.customerName || "N/A"}
                onResolve={handleResolveTicket}
            />
        </div>
    )
}