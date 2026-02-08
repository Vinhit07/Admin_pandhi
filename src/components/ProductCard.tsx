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
    return (
        <div
            className="group bg-card text-card-foreground rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all duration-300"
        >
            {/* Product Image with Overlay */}
            <div className="relative h-44 overflow-hidden bg-muted">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                {/* Food Type Badge - Top Left */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm ${product.foodType === "vegetarian"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                    }`}>
                    {product.foodType === "vegetarian" ? "VEG" : "NON-VEG"}
                </div>

                {/* Price Badge - Bottom Right */}
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full shadow-sm border border-border">
                    <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-3">
                <div className="space-y-1">
                    {/* Category Pill */}
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full uppercase tracking-wider">
                        {product.category}
                    </span>

                    {/* Name */}
                    <h3 className="font-semibold text-card-foreground text-base capitalize leading-tight line-clamp-1">
                        {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 h-[32px]">
                        {product.description}
                    </p>
                </div>

                {/* Stock Indicator */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Stock</span>
                        <span className={`font-medium ${product.inventory.quantity > 50 ? "text-green-600" :
                            product.inventory.quantity > 10 ? "text-yellow-600" : "text-red-600"
                            }`}>
                            {product.inventory.quantity} units
                        </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${product.inventory.quantity > 50 ? "bg-green-500" :
                                product.inventory.quantity > 10 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                            style={{ width: `${Math.min(product.inventory.quantity, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={() => onEdit(product)}
                        className="flex-1 h-9 text-xs font-medium"
                        size="sm"
                    >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                    </Button>
                    <Button
                        onClick={() => onRemove(product.id)}
                        variant="outline"
                        className="flex-1 h-9 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        size="sm"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    )
}
