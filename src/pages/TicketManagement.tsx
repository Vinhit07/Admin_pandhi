import { useState } from "react"
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
import { RefreshCw, Search } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"

interface Ticket {
    ticketId: string
    date: string
    description: string
    raisedBy: string
    email: string
    priority: "high" | "medium" | "low"
    status: "open" | "closed"
}

const mockTickets: Ticket[] = [
    { ticketId: "#TCK006", date: "20-12-2025", description: "Login failed", raisedBy: "Latha Ilanchelan", email: "tharinimohan@gmail.com", priority: "medium", status: "open" },
    { ticketId: "#TCK005", date: "20-12-2019", description: "Payment keeps failing", raisedBy: "Latha Ilanchelan", email: "latha@gmail.com", priority: "high", status: "closed" },
    { ticketId: "#TCK004", date: "20-12-2019", description: "Payment keeps failing", raisedBy: "Latha Ilanchelan", email: "latha@gmail.com", priority: "high", status: "closed" },
    { ticketId: "#TCK003", date: "20-12-2019", description: "Order not available for delivery", raisedBy: "Latha Ilanchelan", email: "latha@gmail.com", priority: "high", status: "open" },
    { ticketId: "#TCK002", date: "20-12-2015", description: "Unable to pay", raisedBy: "Latha Ilanchelan", email: "latha@gmail.com", priority: "high", status: "closed" },
    { ticketId: "#TCK001", date: "20-12-2010", description: "Unable to login", raisedBy: "Latha Ilanchelan", email: "latha@gmail.com", priority: "medium", status: "closed" },
]

export const TicketManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [tickets] = useState(mockTickets)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isChatModalOpen, setIsChatModalOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState("")

    const handleRefresh = () => {
        setSearchQuery("")
        setPriorityFilter("all")
    }

    const handleViewTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsViewModalOpen(true)
    }

    const handleChatTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setIsChatModalOpen(true)
    }

    const handleSendAndClose = () => {
        console.log("Sending message:", chatMessage)
        setChatMessage("")
        setIsChatModalOpen(false)
    }

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, { className: string }> = {
            "high": { className: "bg-red-100 text-red-800 hover:bg-red-100" },
            "medium": { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
            "low": { className: "bg-green-100 text-green-800 hover:bg-green-100" }
        }
        const config = variants[priority] || variants["medium"]
        return <Badge className={config.className}>{priority}</Badge>
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { className: string }> = {
            "open": { className: "bg-green-100 text-green-800 hover:bg-green-100" },
            "closed": { className: "bg-red-100 text-red-800 hover:bg-red-100" }
        }
        const config = variants[status] || variants["open"]
        return <Badge className={config.className}>{status}</Badge>
    }

    // Ticket Columns
    const ticketColumns: ColumnDef<Ticket>[] = [
        {
            accessorKey: "ticketId",
            header: "TICKET ID",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("ticketId")}</span>
            ),
        },
        {
            accessorKey: "date",
            header: "DATE",
        },
        {
            accessorKey: "description",
            header: "TICKET DESCRIPTION",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("description")}</span>
            ),
        },
        {
            accessorKey: "raisedBy",
            header: "TICKET RAISED BY",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("raisedBy")}</span>
            ),
        },
        {
            accessorKey: "priority",
            header: "PRIORITY",
            cell: ({ row }) => getPriorityBadge(row.getValue("priority")),
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
                    >
                        Chat
                    </Button>
                </div>
            ),
        },
    ]

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.raisedBy.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
        return matchesSearch && matchesPriority
    })

    const totalTickets = tickets.length
    const openTickets = tickets.filter(t => t.status === "open").length
    const closedTickets = tickets.filter(t => t.status === "closed").length

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
                    {/* Priority Filter */}
                    <div className="bg-card border-2 border-border rounded-full px-4 py-2 shadow-md">
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[180px] border-0 focus:ring-0">
                                <SelectValue placeholder="All Priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
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
                        <DialogTitle>Ticket Details: {selectedTicket?.ticketId}</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-4 py-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date:</p>
                                <p className="text-base">{selectedTicket.date}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description:</p>
                                <p className="text-base">{selectedTicket.description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Raised By:</p>
                                <p className="text-base">{selectedTicket.raisedBy}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email:</p>
                                <p className="text-base">{selectedTicket.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Priority:</p>
                                <p className="text-base">{selectedTicket.priority}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status:</p>
                                <p className="text-base">{selectedTicket.status}</p>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsViewModalOpen(false)} className="rounded-full">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Chat Modal */}
            <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Chat: {selectedTicket?.ticketId}</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-4 py-4">
                            {/* Chat Messages */}
                            <div className="bg-muted rounded-2xl p-4 min-h-[200px]">
                                <div className="space-y-3">
                                    <div className="bg-background rounded-xl p-3">
                                        <p className="text-sm font-medium">{selectedTicket.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">- {selectedTicket.raisedBy}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="space-y-2">
                                <Input
                                    placeholder="Type your resolution message..."
                                    value={chatMessage}
                                    onChange={(e) => setChatMessage(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Send Button */}
                            <div className="flex justify-end">
                                <Button onClick={handleSendAndClose} className="rounded-full">
                                    Send & Close Ticket
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
