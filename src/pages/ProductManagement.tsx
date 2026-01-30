import { useState, useRef, useEffect } from "react"
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
import { Edit, Trash2, Upload, Loader2 } from "lucide-react"
import { ProductCard } from "../components/ProductCard"
import { useOutlet } from "../context/OutletContext"
import { productService } from "../services/productService"
import { Product } from "../types/api"
import toast from "react-hot-toast"

// Extended Product interface to include UI-specific fields if needed, 
// or just mapping API Product to UI.
// The API Product has: id, name, description, price, category, imageUrl, isAvailable, outletId.
// The UI 'ProductCard' likely expects specific props. I'll need to check ProductCard or adapt here.
// For now I'll assume I can pass the API Product object or map it.

export const ProductManagement = () => {
    const { outletId } = useOutlet()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Category filter
    const [categoryFilter, setCategoryFilter] = useState("All")
    const categories = ["All", "MEALS", "BEVERAGES", "SPECIALFOODS"] // These could also come from API unique valus

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
        // foodType: "vegetarian", // Not in API currently
        imageUrl: null as string | null,
    })

    useEffect(() => {
        if (outletId) {
            fetchProducts()
        }
    }, [outletId])

    const fetchProducts = async () => {
        if (!outletId) return
        try {
            setLoading(true)
            const response = await productService.getProducts(parseInt(outletId))
            if (response.success && response.data) {
                setProducts(response.data)
            }
        } catch (error) {
            console.error("Failed to fetch products", error)
            toast({
                title: "Error",
                description: "Failed to load products",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

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
            imageUrl: null,
        })
    }

    const handleAddProduct = async () => {
        if (!formData.name || !formData.price || !formData.category || !outletId) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            })
            return
        }

        try {
            const response = await productService.addProduct({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                imageUrl: formData.imageUrl || "",
                outletId: parseInt(outletId)
            })

            if (response.success && response.data) {
                setProducts([...products, response.data])
                setIsAddDialogOpen(false)
                resetForm()
                toast({
                    title: "Success",
                    description: "Product added successfully"
                })
            }
        } catch (error) {
            console.error("Error adding product:", error)
            toast({
                title: "Error",
                description: "Failed to add product",
                variant: "destructive"
            })
        }
    }

    const handleEditProduct = async () => {
        if (!editingProduct || !formData.name || !formData.price || !formData.category || !outletId) {
            return
        }

        try {
            const response = await productService.updateProduct(editingProduct.id, {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                imageUrl: formData.imageUrl || "",
            })

            if (response.success && response.data) {
                const updatedProducts = products.map((p) =>
                    p.id === editingProduct.id ? response.data! : p
                )
                setProducts(updatedProducts)
                setIsEditDialogOpen(false)
                setEditingProduct(null)
                resetForm()
                toast({
                    title: "Success",
                    description: "Product updated successfully"
                })
            }
        } catch (error) {
            console.error("Error updating product:", error)
            toast({
                title: "Error",
                description: "Failed to update product",
                variant: "destructive"
            })
        }
    }

    const handleRemoveProduct = async (productId: string | number) => {
        // Confirm delete?
        try {
            const id = typeof productId === 'string' ? parseInt(productId) : productId
            const response = await productService.deleteProduct(id)
            if (response.success) {
                setProducts(products.filter((p) => p.id !== id))
                toast({
                    title: "Success",
                    description: "Product deleted successfully"
                })
            }
        } catch (error) {
            console.error("Error deleting product:", error)
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive"
            })
        }
    }

    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            category: product.category || "",
            imageUrl: product.imageUrl || null,
        })
        setIsEditDialogOpen(true)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({ ...formData, imageUrl: reader.result as string })
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
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                                <p className="text-xs text-muted-foreground">Click to upload</p>
                            </div>
                        )}
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
                        Description
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
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

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
                            product={{
                                ...product,
                                id: product.id.toString(), // Adapter needed here if ProductCard expects string id
                                foodType: "vegetarian", // Default or omitted
                                stock: 0, // Default
                                alertThreshold: 0, // Default
                                minValue: 0, // Default
                                image: product.imageUrl || null
                            }}
                            onEdit={() => openEditDialog(product)}
                            onRemove={() => handleRemoveProduct(product.id)}
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
