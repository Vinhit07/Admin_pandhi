import { useState, useEffect } from "react"
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
    DialogDescription,
} from "../components/ui/dialog"
import { Loader2 } from "lucide-react"
// import { Upload } from "lucide-react"
import { ProductCard } from "../components/ProductCard"
import { useOutlet } from "../context/OutletContext"
import { productService } from "../services/productService"
import type { Product } from "../types/api"
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
    const categories = ["All", "Meals", "Beverages", "SpecialFoods", "Starters", "Desserts"]

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    // const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: null as string | null,
        threshold: "10",
        minValue: "0",
        isVeg: true,
        companyPaid: false,
        outletId: "" // Local outlet selection
    })

    // Update local outletId when global outletId changes, but only if it's a specific outlet
    useEffect(() => {
        if (outletId && outletId !== "ALL") {
            setFormData(prev => ({ ...prev, outletId: outletId.toString() }))
        }
    }, [outletId])

    useEffect(() => {
        // Fetch initially or when outletId changes (including when it's null/'ALL')
        fetchProducts()
    }, [outletId])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            // If outletId is null/All, pass 0 (as per existing logic `outletId === "ALL" ? 0 : outletId`)
            // The existing logic already handled string "ALL", we just need to handle null.
            // If outletId is null/All/undefined, pass 0
            const targetId = (outletId === "ALL" || !outletId) ? 0 : outletId
            console.log("Fetching products for targetId:", targetId)
            const response = await productService.getProducts(targetId)
            console.log("🍴 Products Response:", response)
            if (response.success && response.data) {
                setProducts(response.data)
            }
        } catch (error) {
            console.error("Failed to fetch products", error)
            toast.error("Failed to load products")
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
            threshold: "10",
            minValue: "0",
            isVeg: true,
            companyPaid: false,
            outletId: (outletId && outletId !== "ALL") ? outletId.toString() : ""
        })
        setImageFile(null)
    }

    const handleAddProduct = async () => {
        // Validation: Check name, price, category. Image is OPTIONAL.
        // Outlet validation: Must have a valid outletId (either from global or form)
        const targetOutletId = (outletId && outletId !== "ALL") ? outletId : parseInt(formData.outletId)

        if (!formData.name || !formData.price || !formData.category || !targetOutletId) {
            toast.error("Please fill in all required fields (Name, Price, Category, Outlet)")
            return
        }

        try {
            const response = await productService.addProduct({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                outletId: targetOutletId,
                threshold: parseInt(formData.threshold) || 10,
                minValue: parseInt(formData.minValue) || 0,
                isVeg: formData.isVeg,
                companyPaid: formData.companyPaid,
            }, imageFile || undefined)

            if (response.success && response.data) {
                setProducts([...products, response.data])
                setIsAddDialogOpen(false)
                resetForm()
                toast.success("Product added successfully")
            } else {
                // Check if response itself has error message even if success is false/undefined
                const msg = response.message || "Failed to add product"
                toast.error(msg)
            }
        } catch (error: any) {
            console.error("Error adding product:", error)
            // Extract error message from API response if available
            const errorMsg = error.response?.data?.error || error.message || "Failed to add product";
            // Check for specific "Product already available" message
            if (errorMsg.includes("Product already available")) {
                toast.error("A product with this name already exists.");
            } else {
                toast.error(errorMsg);
            }
        }
    }

    const handleEditProduct = async () => {
        if (!editingProduct) return

        // Validate required fields
        if (!formData.name || !formData.price || !formData.category) {
            toast.error("Please fill in all required fields (Name, Price, Category)")
            return
        }

        try {
            const response = await productService.updateProduct(
                editingProduct.id,
                {
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    outletId: parseInt(formData.outletId),
                    threshold: parseInt(formData.threshold) || 10,
                    minValue: parseInt(formData.minValue) || 0,
                    isVeg: formData.isVeg,
                    companyPaid: formData.companyPaid,
                },
                imageFile || undefined
            )

            if (response.success && response.data) {
                // Update the product in the list
                setProducts(products.map(p => p.id === editingProduct.id ? response.data! : p))
                setIsEditDialogOpen(false)
                setEditingProduct(null)
                resetForm()
                toast.success("Product updated successfully")
            } else {
                const msg = response.message || "Failed to update product"
                toast.error(msg)
            }
        } catch (error: any) {
            console.error("Error updating product:", error)
            const errorMsg = error.response?.data?.error || error.message || "Failed to update product"
            toast.error(errorMsg)
        }
    }

    const handleRemoveProduct = (productId: number) => {
        setDeletingProductId(productId)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDeleteProduct = async () => {
        if (!deletingProductId) return

        try {
            setIsDeleteLoading(true)
            const response = await productService.deleteProduct(deletingProductId)

            if (response.success) {
                // Remove the product from the list
                setProducts(products.filter(p => p.id !== deletingProductId))
                setIsDeleteDialogOpen(false)
                setDeletingProductId(null)
                toast.success("Product deleted successfully")
            } else {
                const msg = response.message || "Failed to delete product"
                toast.error(msg)
            }
        } catch (error: any) {
            console.error("Error deleting product:", error)
            const errorMsg = error.response?.data?.error || error.message || "Failed to delete product"
            toast.error(errorMsg)
        } finally {
            setIsDeleteLoading(false)
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
            threshold: (product.inventory?.threshold || product.alertThreshold || "10").toString(),
            minValue: (product.inventory?.minValue || product.minValue || "0").toString(),
            isVeg: product.isVeg !== undefined ? product.isVeg : true,
            companyPaid: product.companyPaid || false,
            outletId: product.outletId.toString()
        })
        setIsEditDialogOpen(true)
        setImageFile(null)
    }

    /*
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({ ...formData, imageUrl: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }
    */

    const { outlets } = useOutlet(); // Get outlets list for dropdown

    const formJSX = (
        <div className="flex gap-6">
            {/* Left Side: Live Product Preview (COMMENTED OUT) */}
            {/* <div className="w-56 flex-shrink-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Live Preview (Optional)</p>
                <div className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm">
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
            </div> */}

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

                {/* Description - Optional in backend/frontend UI but good to have */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Description
                    </label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Product description..."
                        className="mt-1.5 min-h-[80px] resize-none"
                    />
                </div>

                {/* Outlet Selection - Only show if in "All Outlets" view */}
                {(!outletId || outletId === "ALL") && (
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Outlet <span className="text-destructive">*</span>
                        </label>
                        <Select
                            value={formData.outletId}
                            onValueChange={(value) => setFormData({ ...formData, outletId: value })}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select Outlet" />
                            </SelectTrigger>
                            <SelectContent>
                                {outlets.map((outlet) => (
                                    <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                        {outlet.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

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
                                <SelectItem value="Meals">Meals</SelectItem>
                                <SelectItem value="Beverages">Beverages</SelectItem>
                                <SelectItem value="SpecialFoods">Special Foods</SelectItem>
                                <SelectItem value="Starters">Starters</SelectItem>
                                <SelectItem value="Desserts">Desserts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Threshold & Min Value Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Alert Threshold
                        </label>
                        <Input
                            type="number"
                            value={formData.threshold}
                            onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
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

                {/* Food Type & Company Paid Row */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Food Type
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.isVeg}
                                    onChange={() => setFormData({ ...formData, isVeg: true })}
                                    className="accent-green-600"
                                />
                                <span className="text-sm">Vegetarian</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={!formData.isVeg}
                                    onChange={() => setFormData({ ...formData, isVeg: false })}
                                    className="accent-red-600"
                                />
                                <span className="text-sm">Non-Vegetarian</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.companyPaid}
                                onChange={(e) => setFormData({ ...formData, companyPaid: e.target.checked })}
                                className="accent-blue-600"
                            />
                            <span className="text-sm font-medium">Company Paid</span>
                        </label>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Product Management</h1>
                <p className="text-muted-foreground">Manage product inventory, pricing, and details</p>
            </div>

            {/* Filters and Add Button */}
            <div className="flex items-center justify-between gap-4">
                <div className="bg-card rounded-xl shadow-sm border border-border/50 h-11 px-4 flex items-center">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] border-0 focus:ring-0 h-full p-0">
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
                    className="rounded-xl h-11 px-6 shadow-sm border border-border/10"
                >
                    + Add New Product
                </Button>
            </div>

            {/* Products Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        All Products
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                            {filteredProducts.length}
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={{
                                ...product,
                                description: product.description || "",
                                category: product.category || "",
                                id: product.id?.toString() || `temp-${Math.random()}`,
                                foodType: product.isVeg ? "vegetarian" : "non-vegetarian",
                                stock: product.inventory?.quantity || 0,
                                alertThreshold: product.inventory?.threshold || 10,
                                minValue: product.inventory?.minValue || 0,
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Add New Product</DialogTitle>
                        <DialogDescription>Fill in the product details below</DialogDescription>
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
                        <DialogDescription>Update the product details below</DialogDescription>
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
            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDeleteProduct}
                            disabled={isDeleteLoading}
                        >
                            {isDeleteLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
