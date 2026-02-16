import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

interface OrderItem {
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface OrderDetails {
    orderId: number
    customerName: string
    customerPhone: string
    status: string
    deliveryDate: string
    deliverySlot: string
    type: string
    paymentMethod: string
    items: OrderItem[]
    totalAmount: number
}

interface OrderDetailsDialogProps {
    open: boolean
    onClose: () => void
    order: OrderDetails | null
}

const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
        "PENDING": { bg: "bg-yellow-100", text: "text-yellow-800", label: "pending" },
        "DELIVERED": { bg: "bg-green-100", text: "text-green-800", label: "delivered" },
        "CANCELLED": { bg: "bg-red-100", text: "text-red-800", label: "cancelled" },
        "PARTIALLY_DELIVERED": { bg: "bg-orange-100", text: "text-orange-800", label: "partially delivered" }
    }

    const config = statusMap[status] || statusMap["PENDING"]
    return (
        <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
            {config.label}
        </Badge>
    )
}

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

export const OrderDetailsDialog = ({ open, onClose, order }: OrderDetailsDialogProps) => {
    if (!order) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Order Details: #{order.orderId}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                        <div>
                            <span className="font-semibold">Customer Name: </span>
                            <span>{order.customerName}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Phone Number: </span>
                            <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Status: </span>
                            {getStatusBadge(order.status)}
                        </div>
                        <div>
                            <span className="font-semibold">Delivery Date: </span>
                            <span>{formatDate(order.deliveryDate)}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Delivery Slot: </span>
                            <span>{order.deliverySlot || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Order Type: </span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {order.type}
                            </Badge>
                        </div>
                        <div>
                            <span className="font-semibold">Payment Method: </span>
                            <span>{order.paymentMethod}</span>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800">
                                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Item</th>
                                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Quantity</th>
                                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-right">Unit Price</th>
                                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-right">Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.items || []).map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-200 dark:border-gray-700 p-2">{item.productName}</td>
                                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">{item.quantity}</td>
                                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-right">₹{item.unitPrice.toFixed(2)}</td>
                                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-right">₹{item.totalPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-50 dark:bg-gray-800">
                                    <td colSpan={3} className="border border-gray-200 dark:border-gray-700 p-2 text-right">Grand Total</td>
                                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-right">₹{order.totalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
