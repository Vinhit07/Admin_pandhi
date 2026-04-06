import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog"
import { Badge } from "../ui/badge"

interface StockItem {
    id?: number
    name: string
    category: string
    price: number
    threshold: number
    quantity: number
}

interface StockActionDialogProps {
    isOpen: boolean
    onClose: () => void
    mode: 'ADD' | 'DEDUCT'
    item: StockItem | null
    onConfirm: (quantity: number) => Promise<void>
}

export function StockActionDialog({
    isOpen,
    onClose,
    mode,
    item,
    onConfirm
}: StockActionDialogProps) {
    const [quantity, setQuantity] = useState("")
    const [loading, setLoading] = useState(false)

    if (!item) return null

    const handleConfirm = async () => {
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            return // Or show error
        }

        setLoading(true)
        try {
            await onConfirm(parseInt(quantity))
            setQuantity("") // Reset on success
            onClose()
        } catch (error) {
            console.error("Action failed", error)
        } finally {
            setLoading(false)
        }
    }

    const isAdd = mode === 'ADD'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isAdd ? "Add Stock" : "Deduct Stock"}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Item Details Summary */}
                    <div className="bg-muted/50 p-4 rounded-lg grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-muted-foreground">Item</p>
                            <p className="font-medium">{item.name}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground">Category</p>
                            <p>{item.category}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-muted-foreground">Current Stock</p>
                            <Badge variant={item.quantity <= item.threshold ? "destructive" : "secondary"}>
                                {item.quantity}
                            </Badge>
                        </div>
                    </div>

                    {/* Quantity Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Quantity to {isAdd ? "Add" : "Deduct"}
                        </label>
                        <Input
                            type="number"
                            min="1"
                            placeholder={isAdd ? "Enter quantity to add" : "Enter quantity to deduct"}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="bg-background"
                        />
                        {!isAdd && item.quantity < Number(quantity) && (
                            <p className="text-xs text-red-500">
                                Warning: Deducting more than available stock.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex sm:flex-row flex-col gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading || !quantity || Number(quantity) <= 0}
                        className={isAdd ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    >
                        {loading ? "Processing..." : (isAdd ? "Add Stock" : "Deduct Stock")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
