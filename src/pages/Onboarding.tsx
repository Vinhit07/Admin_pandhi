import { useState, useEffect } from 'react'
import { Check, Shield, Users, Store, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import toast from 'react-hot-toast'
import { adminService } from '../services/adminService'
import { staffService } from '../services/staffService'
import { outletService } from '../services/outletService'
import type { User, Staff, Outlet } from '../types/api'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"

export const Onboarding = () => {
    const [activeTab, setActiveTab] = useState<'admin' | 'staff'>('admin')
    const [loading, setLoading] = useState(true)
    const [admins, setAdmins] = useState<User[]>([])
    const [staff, setStaff] = useState<Staff[]>([])
    const [outlets, setOutlets] = useState<Outlet[]>([])

    // Map Outlet Dialog State
    const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null)
    const [selectedOutletId, setSelectedOutletId] = useState<string>("")



    useEffect(() => {
        fetchData()
        fetchOutlets()
    }, [activeTab])

    const fetchOutlets = async () => {
        try {
            const response = await outletService.getOutlets()
            if (response.success && response.data) {
                setOutlets(response.data)
            }
        } catch (error) {
            console.error("Error fetching outlets", error)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            if (activeTab === 'admin') {
                const response = await adminService.getPendingAdmins()
                if (response.success && response.data) {
                    setAdmins(response.data)
                }
            } else {
                const response = await staffService.getUnverifiedStaff()
                if (response.success && response.data) {
                    setStaff(response.data)
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAdmin = async (id: number) => {
        try {
            const response = await adminService.verifyAdmin(id)
            if (response.success) {
                setAdmins(admins.filter(a => a.id !== id))
                toast.success("Admin verified successfully")
            }
        } catch (error) {
            toast.error("Failed to verify admin")
        }
    }

    const handleVerifyStaff = async (id: number) => {
        try {
            const response = await staffService.verifyStaff(id)
            if (response.success) {
                setStaff(staff.filter(s => s.id !== id))
                toast.success("Staff verified successfully")
            }
        } catch (error) {
            toast.error("Failed to verify staff")
        }
    }

    const openMapDialog = (adminId: number) => {
        setSelectedAdminId(adminId)
        setIsMapDialogOpen(true)
    }

    const handleMapOutlet = async () => {
        if (!selectedAdminId || !selectedOutletId) return

        try {
            const response = await adminService.mapOutletToAdmin(selectedAdminId, parseInt(selectedOutletId))
            if (response.success) {
                toast.success("Outlet mapped successfully")
                setIsMapDialogOpen(false)
                setSelectedOutletId("")
            }
        } catch (error) {
            toast.error("Failed to map outlet")
        }
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboarding Requests</h1>
                    <p className="text-muted-foreground mt-2">Verify new admins and staff members.</p>
                </div>

                <div className="flex p-1 bg-muted/50 rounded-xl border border-border">
                    <button
                        onClick={() => setActiveTab('admin')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'admin' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Admin Onboarding
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'staff' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Staff Onboarding
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'admin' ? (
                        admins.length > 0 ? admins.map(admin => (
                            <div key={admin.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{admin.name}</h3>
                                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4">
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => openMapDialog(admin.id)}>
                                        <Store className="mr-2 h-4 w-4" /> Map Outlet
                                    </Button>
                                    <Button size="sm" className="w-full" onClick={() => handleVerifyAdmin(admin.id)}>
                                        <Check className="mr-2 h-4 w-4" /> Verify & Approve
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                No pending admin requests
                            </div>
                        )
                    ) : (
                        staff.length > 0 ? staff.map(s => (
                            <div key={s.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{s.name}</h3>
                                            <p className="text-sm text-muted-foreground">{s.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground mb-4">
                                    <span className="font-medium text-foreground">Designation:</span> {s.designation || 'N/A'}
                                </div>
                                <Button size="sm" className="w-full" onClick={() => handleVerifyStaff(s.id)}>
                                    <Check className="mr-2 h-4 w-4" /> Verify Staff
                                </Button>
                            </div>
                        )) : (
                            <div className="col-span-full h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                No pending staff requests
                            </div>
                        )
                    )}
                </div>
            )}

            <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Map Outlet to Admin</DialogTitle>
                        <DialogDescription>
                            Select an outlet to assign to this admin before verification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Select Outlet</Label>
                        <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select an outlet" />
                            </SelectTrigger>
                            <SelectContent>
                                {outlets.map(outlet => (
                                    <SelectItem key={outlet.id} value={outlet.id.toString()}>
                                        {outlet.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMapDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleMapOutlet}>Map Outlet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
