import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

interface TicketDetails {
    id: string
    date: string
    description: string
    raisedBy: string
    email: string
    priority: string
    status: string
}

interface TicketDetailsDialogProps {
    open: boolean
    onClose: () => void
    ticket: TicketDetails | null
}

const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { bg: string; text: string }> = {
        "low": { bg: "bg-gray-100", text: "text-gray-800" },
        "medium": { bg: "bg-yellow-100", text: "text-yellow-800" },
        "high": { bg: "bg-red-100", text: "text-red-800" }
    }

    const config = priorityMap[priority.toLowerCase()] || priorityMap["medium"]
    return (
        <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
            {priority}
        </Badge>
    )
}

const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
        "open": { bg: "bg-green-100", text: "text-green-800" },
        "in_progress": { bg: "bg-blue-100", text: "text-blue-800" },
        "closed": { bg: "bg-gray-100", text: "text-gray-800" }
    }

    const config = statusMap[status.toLowerCase()] || statusMap["open"]
    return (
        <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
            {status}
        </Badge>
    )
}

export const TicketDetailsDialog = ({ open, onClose, ticket }: TicketDetailsDialogProps) => {
    if (!ticket) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Ticket Details: #{ticket.id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <span className="font-semibold">Date: </span>
                        <span>{ticket.date}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Description: </span>
                        <span>{ticket.description}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Raised By: </span>
                        <span>{ticket.raisedBy}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Email: </span>
                        <span>{ticket.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Priority: </span>
                        {getPriorityBadge(ticket.priority)}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Status: </span>
                        {getStatusBadge(ticket.status)}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
