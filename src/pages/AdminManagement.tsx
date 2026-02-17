import { useState, useEffect } from 'react'
import { Loader2, Store, ArrowLeft, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react'
import { Button } from '../components/ui/button'
import { adminService } from '../services/adminService'
import type { User } from '../types/api'
import toast from 'react-hot-toast'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// import { Switch } from "../components/ui/switch"
import { Label } from "../components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"

// Permission types matching backend enum
// Permission types matching backend enum
/*
const PERMISSION_TYPES = [
    'ORDER_MANAGEMENT',
    'STAFF_MANAGEMENT',
    'INVENTORY_MANAGEMENT',
    'EXPENDITURE_MANAGEMENT',
    'WALLET_MANAGEMENT',
    'CUSTOMER_MANAGEMENT',
    'TICKET_MANAGEMENT',
    'NOTIFICATIONS_MANAGEMENT',
    'PRODUCT_MANAGEMENT',
    'APP_MANAGEMENT',
    'REPORTS_ANALYTICS',
    'SETTINGS',
    'ONBOARDING',
    'ADMIN_MANAGEMENT',
]
*/

export const AdminManagement = () => {
    const [pageState, setPageState] = useState<'list' | 'detail'>('list')
    const [admins, setAdmins] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null)
    const [adminDetails, setAdminDetails] = useState<any>(null)
    // const [permissions, setPermissions] = useState<any[]>([])
    // We assume single outlet per admin for now as per requirement
    // const [adminOutletId, setAdminOutletId] = useState<number | null>(null)
    // const [saving, setSaving] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        if (pageState === 'list') {
            fetchAdmins()
        }
    }, [pageState])

    useEffect(() => {
        if (selectedAdminId && pageState === 'detail') {
            fetchAdminDetails(selectedAdminId)
        }
    }, [selectedAdminId, pageState])

    const fetchAdmins = async () => {
        try {
            setLoading(true)
            const response = await adminService.getVerifiedAdmins()
            // Go backend returns array directly
            if (Array.isArray(response)) {
                setAdmins(response)
            } else if (response && (response as any).data) {
                // Fallback for wrapped response
                setAdmins((response as any).data)
            }
        } catch (error) {
            console.error("Error fetching admins:", error)
            toast.error("Failed to fetch admins")
        } finally {
            setLoading(false)
        }
    }

    const fetchAdminDetails = async (id: number) => {
        try {
            setLoading(true)
            const response = await adminService.getAdminDetails(id)
            if (response) { // Response is directly the object in some cases or success field in others? 
                // Based on controller, it returns `adminWithSignedUrls` directly or formatted response.
                // adminService wrapper expects ApiResponse, but controller returns standard JSON.
                // Let's assume response is the data if success/data paradigm isn't strictly followed by that specific controller output
                // But adminService uses apiRequest which parses JSON. 
                // Controller `getAdminDetails` returns object directly, NOT { success: true, data: ... }
                // Wait, apiRequest returns `data`? No, it returns `response.json()`.
                // Controller `getAdminDetails` sends `res.status(200).json(adminWithSignedUrls)`.
                // So the response IS the admin object. 

                // However, `adminService.getPermissions` (if used) or `getVerifiedAdmins` returns array.
                // Let's handle it safely.
                const details = response // generic type in service allows this flexibility
                setAdminDetails(details)

                // Extract permissions for the first outlet
                /*
                if (details.outlets && details.outlets.length > 0) {
                    const firstOutlet = details.outlets[0]
                    setAdminOutletId(firstOutlet.outletId)

                    // Initialize permissions state
                    // Map existing permissions to state
                    const existingPerms = firstOutlet.permissions || []

                    // Initialize all types with status
                    const mappedPerms = PERMISSION_TYPES.map(type => {
                        const existing = existingPerms.find((p: any) => p.type === type)
                        return {
                            type,
                            isGranted: existing ? existing.isGranted : false
                        }
                    })
                    setPermissions(mappedPerms)
                }
                */
            }
        } catch (error) {
            console.error("Error fetching admin details:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdminClick = (id: number) => {
        setSelectedAdminId(id)
        setPageState('detail')
    }

    const handleBack = () => {
        setSelectedAdminId(null)
        setPageState('list')
        setAdminDetails(null)
    }

    /*
    const handlePermissionToggle = (type: string) => {
        setPermissions(prev => prev.map(p =>
            p.type === type ? { ...p, isGranted: !p.isGranted } : p
        ))
    }

    const handleUpdatePermissions = async () => {
        if (!selectedAdminId || !adminOutletId) return

        try {
            setSaving(true)
            const permissionsPayload = {
                [adminOutletId]: permissions.map(p => ({
                    type: p.type,
                    isGranted: p.isGranted
                }))
            }

            await adminService.assignAdminPermissions(selectedAdminId, permissionsPayload)
            toast.success("Permissions updated successfully")
        } catch (error) {
            console.error("Error updating permissions:", error)
            toast.error("Failed to update permissions")
        } finally {
            setSaving(false)
        }
    }
    */

    const handleRemoveAdmin = async () => {
        if (!selectedAdminId) return

        try {
            setLoading(true)
            await adminService.deleteAdmin(selectedAdminId)
            toast.success("Admin removed successfully")
            handleBack()
            fetchAdmins() // Refresh list
        } catch (error) {
            console.error("Error removing admin:", error)
            toast.error("Failed to remove admin")
        } finally {
            setLoading(false)
        }
    }

    if (pageState === 'list') {
        return (
            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
                    <p className="text-muted-foreground mt-2">Manage verified administrators and their permissions.</p>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {admins.length > 0 ? admins.map(admin => (
                            <div
                                key={admin.id}
                                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => handleAdminClick(admin.id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {admin.imageUrl ? (
                                                <img src={admin.imageUrl} alt={admin.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={32} className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{admin.name}</h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Mail size={14} /> {admin.email}
                                            </p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                <Phone size={14} /> {admin.phone || 'N/A'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    admin
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                No verified admins found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // Detail View
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {adminDetails?.name ? `Admin Details: ${adminDetails.name}` : 'Admin Details'}
                    </h1>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : adminDetails ? (
                <div className="flex justify-center w-full">
                    {/* <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="details">Admin Details</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    </TabsList> */}

                    {/* <TabsContent value="details"> */}
                    <div className="bg-card border border-border rounded-xl p-8 max-w-3xl w-full shadow-md">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                                {adminDetails.imageUrl ? (
                                    <img src={adminDetails.imageUrl} alt={adminDetails.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={64} className="text-muted-foreground" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold">{adminDetails.name}</h2>
                            <p className="text-muted-foreground">Admin</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                    {adminDetails.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                    Admin
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                    {adminDetails.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                    {adminDetails.phone || 'N/A'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Joined Date</Label>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-center gap-2">
                                    <Calendar size={16} className="text-muted-foreground" />
                                    {new Date(adminDetails.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Vendor</Label>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-center gap-2">
                                    <Store size={16} className="text-muted-foreground" />
                                    {adminDetails.outlets?.[0]?.outlet?.name || 'Not assigned'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-2">
                            {/* Update Details not yet supported by backend */}
                            {/* <Button>Update Details</Button> */}
                            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>Remove Admin</Button>
                        </div>
                    </div>


                    {/* </TabsContent> */}

                    {/* <TabsContent value="permissions">
                        <div className="bg-card border border-border rounded-xl p-8 max-w-3xl">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold">Vendor-wise Permissions</h3>
                                {adminDetails.outlets?.[0]?.outlet?.name && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Managing permissions for vendor: <span className="font-medium text-foreground">{adminDetails.outlets[0].outlet.name}</span>
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {permissions.map((perm) => (
                                    <div key={perm.type} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                                        <div className="flex-1">
                                            <Label htmlFor={`perm-${perm.type}`} className="text-base font-medium cursor-pointer">
                                                {perm.type.replace(/_/g, ' ')}
                                            </Label>
                                        </div>
                                        <Switch
                                            id={`perm-${perm.type}`}
                                            checked={perm.isGranted}
                                            onCheckedChange={() => handlePermissionToggle(perm.type)}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Button onClick={handleUpdatePermissions} disabled={saving} size="lg" className="min-w-[200px]">
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Permissions'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </TabsContent> */}

                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Admin details not found.
                </div>
            )}


            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Admin</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this admin? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRemoveAdmin}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
