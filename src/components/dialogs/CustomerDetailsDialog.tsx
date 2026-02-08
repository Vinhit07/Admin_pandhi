import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"

interface CustomerDetails {
    id: number
    walletId: number
    yearOfStudy: number
    phone: string
    email: string
    walletBalance: number
    totalOrders: number
    totalPurchase: number
    lastOrderDate: string
    name: string
}

interface CustomerDetailsDialogProps {
    open: boolean
    onClose: () => void
    customer: CustomerDetails | null
}

const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

export const CustomerDetailsDialog = ({ open, onClose, customer }: CustomerDetailsDialogProps) => {
    if (!customer) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Customer: {customer.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-1">
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Customer ID</td>
                                <td className="py-2 text-orange-600">{customer.id}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Wallet ID</td>
                                <td className="py-2 text-orange-600">{customer.walletId}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Year</td>
                                <td className="py-2 text-orange-600">{customer.yearOfStudy}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Phone Number</td>
                                <td className="py-2 text-orange-600">{customer.phone}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Email</td>
                                <td className="py-2 text-orange-600">{customer.email}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Wallet Balance</td>
                                <td className="py-2 text-orange-600">₹{customer.walletBalance.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Total Orders</td>
                                <td className="py-2 text-orange-600">{customer.totalOrders}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Total Purchase</td>
                                <td className="py-2 text-orange-600">₹{customer.totalPurchase.toFixed(2)}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-2 font-medium">Last Order Date</td>
                                <td className="py-2 text-orange-600">{formatDate(customer.lastOrderDate)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
