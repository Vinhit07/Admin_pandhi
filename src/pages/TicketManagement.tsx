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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import { useOutlet } from "../context/OutletContext"
import { ticketService } from "../services/ticketService"
import type { Ticket } from "../types/api"
import toast from "react-hot-toast"

export const TicketManagement = () => {
    const { outletId } = useOutlet()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isChatModalOpen, setIsChatModalOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState("")

    useEffect(() => {
        if (outletId) {
            setLoading(true)
            fetchTickets()
        } else {
            setLoading(false)
        }
    }, [outletId])

    const fetchTickets = async () => {
        if (!outletId) return
        try {
            setLoading(true)
            const response = await ticketService.getTickets(outletId)
            // Assuming response.data is the list of tickets
            if (response.success && response.data) {
                // Check if data is array or wrapped
                setTickets(Array.isArray(response.data) ? response.data : [])
            } else {
                setTickets([]) // or handle error
            }
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

    const handleSendAndClose = async () => {
        if (!selectedTicket) return

        // In a real scenario, we might post a message. 
        // Here we will just close the ticket as per available service method.
        try {
            const response = await ticketService.closeTicket(selectedTicket.id)
            if (response.success) {
                toast.success("Ticket closed successfully")
                // Refresh list
                fetchTickets()
                setChatMessage("")
                setIsChatModalOpen(false)
            }
        } catch (error) {
            console.error("Error closing ticket:", error)
            toast.error("Failed to close ticket")
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

    // Ticket Columns
    const ticketColumns: ColumnDef<Ticket>[] = [
        {
            accessorKey: "id",
            header: "TICKET ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">#{row.getValue("id")}</span>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "DATE",
            cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString()
        },
        {
            accessorKey: "issueType",
            header: "ISSUE TYPE",
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
            header: "CUSTOMER",  // Need to join or ensured by API
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

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.id.toString().includes(searchQuery) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalTickets = tickets.length
    const openTickets = tickets.filter(t => t.status === "OPEN").length
    const closedTickets = tickets.filter(t => t.status === "CLOSED").length

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-2">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Total tickets</p>
                        <p className="text-4xl font-bold text-primary">{totalTickets}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-2">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Open Tickets</p>
                        <p className="text-4xl font-bold text-primary">{openTickets}</p>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-2">
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
                    <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] border-0 focus:ring-0">
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
                    <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 max-w-md">
                        <Search size={20} className="text-muted-foreground" />
                        <Input
                            placeholder="Search by Id, description or name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        />
                    </div>

                    {/* Refresh Button */}
                    <Button onClick={handleRefresh} className="rounded-full px-6 shadow-md">
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Ticket Details Table */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>
                <DataTable columns={ticketColumns} data={filteredTickets} />
            </div>

            {/* View Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Ticket Details: #{selectedTicket?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-4 py-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date:</p>
                                <p className="text-base">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Issue Type:</p>
                                <p className="text-base">{selectedTicket.issueType}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description:</p>
                                <p className="text-base">{selectedTicket.description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer:</p>
                                <p className="text-base">{selectedTicket.customerName || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status:</p>
                                <p className="text-base">{getStatusBadge(selectedTicket.status)}</p>
                            </div>
                            {selectedTicket.orderId && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Order ID:</p>
                                    <p className="text-base">{selectedTicket.orderId}</p>
                                </div>
                            )}
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsViewModalOpen(false)} className="rounded-full">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Chat/Resolve Modal */}
            <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Resolve Ticket: #{selectedTicket?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted rounded-2xl p-4 min-h-[100px]">
                                <div className="space-y-3">
                                    <div className="bg-background rounded-xl p-3">
                                        <p className="text-sm font-medium">{selectedTicket.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">- {selectedTicket.customerName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Resolution Note (Optional)</p>
                                <Input
                                    placeholder="Enter resolution details..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSendAndClose} className="rounded-full">
                                    Resolve & Close Ticket
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
