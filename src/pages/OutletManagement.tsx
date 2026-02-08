import { useState, useEffect } from 'react'
import { Plus, Store, Trash2, MapPin, Phone, Mail, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import toast from 'react-hot-toast'
import { outletService } from '../services/outletService'
import type { OutletCreateRequest } from '../services/outletService'
import type { Outlet } from '../types/api'

export const OutletManagement = () => {
    const [outlets, setOutlets] = useState<Outlet[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [formData, setFormData] = useState<OutletCreateRequest>({
        name: '',
        address: '',
        phone: '',
        email: '',
    })


    useEffect(() => {
        fetchOutlets()
    }, [])

    const fetchOutlets = async () => {
        try {
            setLoading(true)
            const response = await outletService.getOutlets()
            if (response.success && response.data) {
                setOutlets(response.data)
            }

        } catch (error) {
            console.error('Error fetching outlets:', error)
            toast.error("Failed to fetch outlets")
        } finally {
            setLoading(false)
        }
    }

    const handleAddOutlet = async () => {
        try {
            if (!formData.name || !formData.address || !formData.phone || !formData.email) {
                toast.error("Please fill in all fields")
                return
            }

            const response = await outletService.addOutlet(formData)
            if (response.success && response.data) {
                setOutlets([...outlets, response.data])
                setIsAddDialogOpen(false)
                setFormData({ name: '', address: '', phone: '', email: '' })
                toast.success("Outlet added successfully")
            }
        } catch (error: any) {
            console.error('Error adding outlet:', error)
            toast.error(error.message || "Failed to add outlet")
        }
    }

    const handleRemoveOutlet = async (id: number) => {
        if (!confirm('Are you sure you want to remove this outlet? This action cannot be undone.')) return

        try {
            const response = await outletService.removeOutlet(id)
            if (response.success) {
                setOutlets(outlets.filter(o => o.id !== id))
                toast.success("Outlet removed successfully")
            }
        } catch (error: any) {
            console.error('Error removing outlet:', error)
            toast.error(error.message || "Failed to remove outlet")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Outlet Management</h1>
                    <p className="text-muted-foreground mt-2">Manage your outlets across different locations.</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={16} />
                            Add New Outlet
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Outlet</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new outlet below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Outlet Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. HungerBox HQ"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    placeholder="Full address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="outlet@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddOutlet}>Add Outlet</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {outlets.map((outlet) => (
                    <div key={outlet.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="h-32 bg-muted/50 flex items-center justify-center border-b border-border">
                            <Store className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <div className="p-5">
                            <h3 className="font-semibold text-lg mb-1">{outlet.name}</h3>
                            <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                    <span>{outlet.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>{outlet.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{outlet.email || 'No email'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveOutlet(outlet.id)}
                            >
                                <Trash2 size={16} className="mr-2" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {outlets.length === 0 && !loading && (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    <Store className="w-12 h-12 mb-4 opacity-20" />
                    <p>No outlets found. Add your first outlet above.</p>
                </div>
            )}
        </div>
    )
}
