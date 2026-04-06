import { Edit, Trash2 } from "lucide-react"
import { Button } from "./ui/button"

interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    foodType: "vegetarian" | "non-vegetarian"
    image: string | null
    alertThreshold: number
    minValue: number
    stock: number
}

interface ProductCardProps {
    product: Product
    onEdit: (product: Product) => void
    onRemove: (productId: string) => void
}

export const ProductCard = ({ product, onEdit, onRemove }: ProductCardProps) => {
    const stockLevel = product.stock > 50 ? "high" : product.stock > 10 ? "medium" : "low"
    const stockColor = {
        high: { text: "text-green-600", bg: "bg-green-500", pill: "bg-green-50 text-green-700 border-green-200" },
        medium: { text: "text-yellow-600", bg: "bg-yellow-500", pill: "bg-yellow-50 text-yellow-700 border-yellow-200" },
        low: { text: "text-red-600", bg: "bg-red-500", pill: "bg-red-50 text-red-700 border-red-200" },
    }[stockLevel]

    return (
        <div className="group bg-card text-card-foreground rounded-xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 flex flex-col">
            {/* Top Row: Name + Price */}
            <div className="p-4 pb-0 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        {/* Food Type Indicator (standard Indian square symbol) */}
                        <span className={`w-4 h-4 shrink-0 rounded-[2px] border-2 flex items-center justify-center ${product.foodType === "vegetarian" ? "border-green-600" : "border-red-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.foodType === "vegetarian" ? "bg-green-600" : "bg-red-600"}`} />
                        </span>
                        <h3 className="font-semibold text-card-foreground text-sm capitalize leading-tight truncate">
                            {product.name}
                        </h3>
                    </div>
                    {/* Category */}
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full uppercase tracking-wider">
                        {product.category}
                    </span>
                </div>
                <span className="text-base font-bold text-foreground whitespace-nowrap shrink-0">
                    ₹{product.price}
                </span>
            </div>

            {/* Description */}
            <div className="px-4 pt-2">
                <div className="max-h-[60px] overflow-y-auto text-xs text-muted-foreground scrollbar-thin">
                    <p>{product.description || "No description available"}</p>
                </div>
            </div>

            {/* Stock Bar */}
            <div className="px-4 pt-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Stock</span>
                    <span className={`font-medium px-1.5 py-0.5 rounded border text-[10px] ${stockColor.pill}`}>
                        {product.stock} units
                    </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${stockColor.bg}`}
                        style={{ width: `${Math.min(product.stock, 100)}%` }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-3 mt-auto flex gap-2">
                <Button
                    onClick={() => onEdit(product)}
                    className="flex-1 h-8 text-xs font-medium rounded-lg"
                    size="sm"
                >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                </Button>
                <Button
                    onClick={() => onRemove(product.id)}
                    variant="outline"
                    className="flex-1 h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 rounded-lg"
                    size="sm"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                </Button>
            </div>
        </div>
    )
}
