import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

interface TicketChatDialogProps {
    open: boolean
    onClose: () => void
    ticketId: string
    ticketDescription: string
    customerName: string
    onResolve: (ticketId: string, resolutionNote: string) => Promise<void>
}

export const TicketChatDialog = ({
    open,
    onClose,
    ticketId,
    ticketDescription,
    customerName,
    onResolve
}: TicketChatDialogProps) => {
    const [resolutionNote, setResolutionNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSendAndClose = async () => {
        if (!resolutionNote.trim()) {
            alert("Please enter a resolution message")
            return
        }

        setIsSubmitting(true)
        try {
            await onResolve(ticketId, resolutionNote)
            setResolutionNote("")
            onClose()
        } catch (error) {
            console.error("Failed to resolve ticket:", error)
            alert("Failed to resolve ticket. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Chat: #{ticketId}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Ticket Description */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-semibold text-gray-600 mb-1">
                            {ticketDescription}
                        </div>
                        <div className="text-xs text-gray-500">
                            {customerName}
                        </div>
                    </div>

                    {/* Resolution Input */}
                    <div>
                        <Textarea
                            placeholder="Type your resolution message..."
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSendAndClose}
                            disabled={isSubmitting || !resolutionNote.trim()}
                        >
                            {isSubmitting ? "Resolving..." : "Send & Close Ticket"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
