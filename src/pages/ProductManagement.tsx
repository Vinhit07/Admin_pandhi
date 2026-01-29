import { useState, useRef } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog"
import { Edit, Trash2, Upload } from "lucide-react"
import { ProductCard } from "../components/ProductCard"

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

const mockProducts: Product[] = [
    {
        id: "1",
        name: "briyani",
        description: "Briyani from store",
        price: 110,
        category: "MEALS",
        foodType: "non-vegetarian",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
        alertThreshold: 10,
        minValue: 0,
        stock: 33,
    },
    {
        id: "2",
        name: "butter milk",
        description: "the tangy liquid that remains after butter is churned from cream.",
        price: 10,
        category: "BEVERAGES",
        foodType: "vegetarian",
        image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop",
        alertThreshold: 10,
        minValue: 0,
        stock: 990,
    },
    {
        id: "3",
        name: "coffee",
        description: "Coffee kudinga themba irunga",
        price: 12,
        category: "MEALS",
        foodType: "vegetarian",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
        alertThreshold: 10,
        minValue: 0,
        stock: 994,
    },
    {
        id: "4",
        name: "idily",
        description: "Idly the great",
        price: 20,
        category: "MEALS",
        foodType: "vegetarian",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
        alertThreshold: 10,
        minValue: 0,
        stock: 19,
    },
    {
        id: "5",
        name: "lemon juice",
        description: "Lemon and spoon",
        price: 20,
        category: "SPECIALFOODS",
        foodType: "vegetarian",
        image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop",
        alertThreshold: 10,
        minValue: 0,
        stock: 1,
    },
]

const categories = ["All", "MEALS", "BEVERAGES", "SPECIALFOODS"]

export const ProductManagement = () => {
    const [products, setProducts] = useState<Product[]>(mockProducts)
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        foodType: "vegetarian" as "vegetarian" | "non-vegetarian",
        image: null as string | null,
        alertThreshold: "10",
        minValue: "0",
        stock: "0",
    })

    const filteredProducts = products.filter((product) => {
        if (categoryFilter === "All") return true
        return product.category === categoryFilter
    })

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            foodType: "vegetarian",
            image: null,
            alertThreshold: "10",
            minValue: "0",
            stock: "0",
        })
    }

    const handleAddProduct = () => {
        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            return
        }

        const newProduct: Product = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            foodType: formData.foodType,
            image: formData.image,
            alertThreshold: parseInt(formData.alertThreshold) || 10,
            minValue: parseInt(formData.minValue) || 0,
            stock: parseInt(formData.stock) || 0,
        }

        setProducts([...products, newProduct])
        setIsAddDialogOpen(false)
        resetForm()
    }

    const handleEditProduct = () => {
        if (!editingProduct || !formData.name || !formData.description || !formData.price || !formData.category) {
            return
        }

        const updatedProducts = products.map((p) =>
            p.id === editingProduct.id
                ? {
                    ...p,
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    foodType: formData.foodType,
                    image: formData.image,
                    alertThreshold: parseInt(formData.alertThreshold) || 10,
                    minValue: parseInt(formData.minValue) || 0,
                    stock: parseInt(formData.stock) || 0,
                }
                : p
        )

        setProducts(updatedProducts)
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        resetForm()
    }

    const handleRemoveProduct = (productId: string) => {
        setProducts(products.filter((p) => p.id !== productId))
    }

    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            foodType: product.foodType,
            image: product.image,
            alertThreshold: product.alertThreshold.toString(),
            minValue: product.minValue.toString(),
            stock: product.stock.toString(),
        })
        setIsEditDialogOpen(true)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    const formJSX = (
        <div className="flex gap-6">
            {/* Left Side: Live Product Preview */}
            <div className="w-56 flex-shrink-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Live Preview</p>
                <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
                    {/* Preview Image */}
                    <div
                        className="h-32 bg-muted flex items-center justify-center cursor-pointer relative overflow-hidden group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {formData.image ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                                <p className="text-xs text-muted-foreground">Click to upload</p>
                            </div>
                        )}
                        {/* Food Type Badge */}
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-sm border-2 ${formData.foodType === "vegetarian" ? "border-green-500 bg-green-500" : "border-red-500 bg-red-500"} flex items-center justify-center`}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Fields */}
            <div className="flex-1 space-y-4">
                {/* Product Name */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Product Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Chicken Biryani"
                        className="mt-1.5"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Description <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your product..."
                        className="mt-1.5 min-h-[80px] resize-none"
                    />
                </div>

                {/* Price & Category Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Price (₹) <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0"
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Category <span className="text-destructive">*</span>
                        </label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEALS">Meals</SelectItem>
                                <SelectItem value="BEVERAGES">Beverages</SelectItem>
                                <SelectItem value="SPECIALFOODS">Special Foods</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Food Type */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Food Type <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-3 mt-1.5">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, foodType: "vegetarian" })}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all border ${formData.foodType === "vegetarian"
                                ? "bg-green-500 border-green-600 text-white shadow-sm"
                                : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${formData.foodType === "vegetarian" ? "bg-white" : "bg-green-500"}`} />
                            Vegetarian
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, foodType: "non-vegetarian" })}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all border ${formData.foodType === "non-vegetarian"
                                ? "bg-red-500 border-red-600 text-white shadow-sm"
                                : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${formData.foodType === "non-vegetarian" ? "bg-white" : "bg-red-500"}`} />
                            Non-Veg
                        </button>
                    </div>
                </div>

                {/* Stock Settings */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Stock <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Alert Threshold
                        </label>
                        <Input
                            type="number"
                            value={formData.alertThreshold}
                            onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                            placeholder="10"
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Min Value
                        </label>
                        <Input
                            type="number"
                            value={formData.minValue}
                            onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                            placeholder="0"
                            className="mt-1.5"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
                <p className="text-muted-foreground mt-2">Manage your product inventory, pricing, and details.</p>
            </div>

            {/* Filters and Add Button */}
            <div className="flex items-center justify-between gap-4 p-1 bg-muted/50 rounded-2xl border border-border">
                <div className="flex items-center gap-2 p-1">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-background border-border shadow-sm">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat === "All" ? "All Categories" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={() => {
                        resetForm()
                        setIsAddDialogOpen(true)
                    }}
                    className="shadow-sm"
                >
                    + Add New Product
                </Button>
            </div>

            {/* Products Section */}
            <div className="bg-muted/30 border border-border/50 rounded-3xl p-8 min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        All Products
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {filteredProducts.length}
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={openEditDialog}
                            onRemove={handleRemoveProduct}
                        />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        <div className="text-4xl mb-4">🍽️</div>
                        <p className="font-medium">No products found</p>
                        <p className="text-sm mt-1">Try changing the category filter or add a new product</p>
                    </div>
                )}
            </div>

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    {formJSX}
                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddProduct}>
                            Add Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    {formJSX}
                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false)
                                setEditingProduct(null)
                                resetForm()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditProduct}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
