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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                    {/* Preview Image */}
                    <div
                        className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
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
                            <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-1" />
                                <p className="text-xs text-gray-400">Click to upload</p>
                            </div>
                        )}
                        {/* Food Type Badge */}
                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-sm border-2 ${formData.foodType === "vegetarian" ? "border-green-500" : "border-red-500"} bg-white flex items-center justify-center`}>
                            <div className={`w-2 h-2 rounded-full ${formData.foodType === "vegetarian" ? "bg-green-500" : "bg-red-500"}`} />
                        </div>
                    </div>
                    {/* Preview Info */}
                    <div className="p-3">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                            {formData.category || "Category"}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm mt-0.5">
                            {formData.name || "Product Name"}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                            {formData.description || "Product description..."}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                            <span className="text-base font-bold text-green-600">
                                ₹{formData.price || "0"}
                            </span>
                            <span className="text-[10px] text-green-600">In stock</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Fields */}
            <div className="flex-1 space-y-3">
                {/* Product Name */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Product Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Chicken Biryani"
                        className="mt-1 h-9 rounded-lg border-gray-300"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your product..."
                        className="mt-1 min-h-[60px] rounded-lg border-gray-300 resize-none"
                    />
                </div>

                {/* Price & Category Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0"
                            className="mt-1 h-9 rounded-lg border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="mt-1 h-9 rounded-lg border-gray-300">
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
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Food Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 mt-1">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, foodType: "vegetarian" })}
                            className={`flex-1 py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${formData.foodType === "vegetarian"
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${formData.foodType === "vegetarian" ? "bg-white" : "bg-green-500"}`} />
                            Vegetarian
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, foodType: "non-vegetarian" })}
                            className={`flex-1 py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${formData.foodType === "non-vegetarian"
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ${formData.foodType === "non-vegetarian" ? "bg-white" : "bg-red-500"}`} />
                            Non-Veg
                        </button>
                    </div>
                </div>

                {/* Stock Settings */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Stock <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                            className="mt-1 h-9 rounded-lg border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Alert Threshold
                        </label>
                        <Input
                            type="number"
                            value={formData.alertThreshold}
                            onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                            placeholder="10"
                            className="mt-1 h-9 rounded-lg border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Min Value
                        </label>
                        <Input
                            type="number"
                            value={formData.minValue}
                            onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                            placeholder="0"
                            className="mt-1 h-9 rounded-lg border-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
            </div>

            {/* Filters and Add Button */}
            <div className="flex items-center justify-between">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[120px] bg-yellow-100 border-2 border-yellow-200 rounded-md text-foreground">
                        <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat === "All" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <button
                    onClick={() => {
                        resetForm()
                        setIsAddDialogOpen(true)
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                >
                    + Add Product
                </button>
            </div>

            {/* Products Section */}
            <div className="bg-pink-100 border-2 border-pink-200 rounded-3xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4 text-foreground">All Products</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                        >
                            {/* Product Image with Overlay */}
                            <div className="relative h-44 overflow-hidden">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-300">
                                        <span className="text-4xl">🍽️</span>
                                    </div>
                                )}

                                {/* Dark overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                                {/* Food Type Badge - Top Left */}
                                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${product.foodType === "vegetarian"
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                    }`}>
                                    {product.foodType === "vegetarian" ? "● VEG" : "● NON-VEG"}
                                </div>

                                {/* Price Badge - Bottom Right */}
                                <div className="absolute bottom-3 right-3 px-4 py-2 bg-white rounded-full shadow-lg">
                                    <span className="text-lg font-black text-green-600">₹{product.price}</span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-5 flex flex-col">
                                {/* Category Pill */}
                                <span className="self-start px-3 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full">
                                    {product.category}
                                </span>

                                {/* Name */}
                                <h3 className="font-bold text-gray-800 text-lg mt-2 capitalize leading-tight">
                                    {product.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed h-[40px]">
                                    {product.description}
                                </p>

                                {/* Stock Indicator */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-500">Stock</span>
                                        <span className={`font-bold ${product.stock > 50 ? "text-green-600" :
                                            product.stock > 10 ? "text-yellow-600" : "text-red-500"
                                            }`}>
                                            {product.stock} units
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${product.stock > 50 ? "bg-green-500" :
                                                product.stock > 10 ? "bg-yellow-500" : "bg-red-500"
                                                }`}
                                            style={{ width: `${Math.min(product.stock, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-5">
                                    <button
                                        onClick={() => openEditDialog(product)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleRemoveProduct(product.id)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-white text-red-500 border-2 border-red-200 hover:bg-red-50 hover:border-red-400 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No products found in this category.
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
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddProduct}
                            className="bg-green-600 hover:bg-green-700"
                        >
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
                    <DialogFooter className="gap-2">
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
                        <Button
                            onClick={handleEditProduct}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
