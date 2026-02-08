import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Switch } from "../components/ui/switch"
import { ArrowLeft, User, Mail, Phone, Briefcase, Loader2 } from "lucide-react"
import { staffService } from "../services"
import type { Staff } from "../types/api"

// 1. Define the Mapping
const PERMISSION_MAPPING: Record<string, string> = {
    // Frontend Key : Backend Key
    billing: "BILLING",
    productInsight: "PRODUCT_INSIGHTS", // Note the plural 'S' and underscore
    inventory: "INVENTORY",
    reports: "REPORTS",
}

// Reverse mapping for reading data from API
const BACKEND_TO_FRONTEND_MAPPING: Record<string, string> = Object.entries(PERMISSION_MAPPING).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
)

export const StaffDetail = () => {
    const { staffId } = useParams<{ staffId: string }>()
    const navigate = useNavigate()

    const [staff, setStaff] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    // Frontend state uses camelCase
    const [permissions, setPermissions] = useState({
        billing: false,
        productInsight: false,
        inventory: false,
        reports: false,
    })

    useEffect(() => {
        if (staffId) {
            fetchStaffDetail()
        }
    }, [staffId])

    const fetchStaffDetail = async () => {
        if (!staffId) return
        try {
            setLoading(true)
            const response = await staffService.getStaffById(parseInt(staffId))

            if (response.success && response.data) {
                const apiData = response.data as any;
                const userData = apiData.user || {};
                const staffDetails = apiData.data || {};

                const mergedStaff = {
                    ...userData,
                    designation: staffDetails.staffRole || userData.role || 'Staff',
                }

                setStaff(mergedStaff)

                // FIX: Map Backend Types to Frontend State
                if (staffDetails.permissions && Array.isArray(staffDetails.permissions)) {
                    const newPermissions = {
                        billing: false,
                        productInsight: false,
                        inventory: false,
                        reports: false,
                    };

                    staffDetails.permissions.forEach((p: any) => {
                        // Convert Backend Type (e.g., PRODUCT_INSIGHTS) to Frontend Key (productInsight)
                        const frontendKey = BACKEND_TO_FRONTEND_MAPPING[p.type];

                        // @ts-ignore
                        if (frontendKey && newPermissions.hasOwnProperty(frontendKey)) {
                            // @ts-ignore
                            newPermissions[frontendKey] = p.isGranted;
                        }
                    });

                    setPermissions(newPermissions);
                }
            }
        } catch (error) {
            console.error("Error fetching staff detail:", error)
            alert("Failed to load staff details")
        } finally {
            setLoading(false)
        }
    }

    const handlePermissionChange = (permission: keyof typeof permissions) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }))
    }

    const handleUpdatePermissions = async () => {
        if (!staffId) return
        try {
            // FIX: Convert Frontend Keys to Backend Types before sending
            const permissionsArray = Object.entries(permissions).map(([key, isGranted]) => ({
                type: PERMISSION_MAPPING[key], // Convert 'productInsight' -> 'PRODUCT_INSIGHTS'
                isGranted
            }))

            const response = await staffService.updatePermissions({
                staffId: parseInt(staffId),
                permissions: permissionsArray
            })
            if (response.success) {
                toast.success("Permissions updated successfully")
                fetchStaffDetail()
            }
        } catch (error) {
            console.error("Error updating permissions:", error)
            // It might still fail if there are other issues, but this fixes the "Invalid input" regarding enums
            toast.error("Failed to update permissions")
        }
    }

    const handleRemoveStaff = async () => {
        if (!staffId || !confirm("Are you sure you want to remove this staff member?")) return
        try {
            const response = await staffService.deleteStaff(parseInt(staffId))
            if (response.success) {
                toast.success("Staff member removed successfully")
                navigate("/staff-management")
            }
        } catch (error) {
            console.error("Error removing staff:", error)
            toast.error("Failed to remove staff member")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!staff) {
        return (
            <div className="space-y-6">
                <p>Staff not found</p>
                <Button onClick={() => navigate("/staff-management")}>
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Staff List
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Button
                variant="outline"
                onClick={() => navigate("/staff-management")}
                className="rounded-full"
            >
                <ArrowLeft size={18} className="mr-2" />
                Back
            </Button>

            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="details">Staff Details</TabsTrigger>
                        <TabsTrigger value="permissions">Permission</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <div className="flex flex-col items-center space-y-6">
                            <Avatar className="w-32 h-32">
                                <AvatarFallback className="bg-muted text-muted-foreground text-4xl">
                                    <User size={60} />
                                </AvatarFallback>
                            </Avatar>

                            <h2 className="text-2xl font-bold">{staff.name}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Name</span>
                                    </div>
                                    <p className="font-medium">{staff.name}</p>
                                </div>
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Designation</span>
                                    </div>
                                    <p className="font-medium">{staff.designation || 'N/A'}</p>
                                </div>
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Email</span>
                                    </div>
                                    <p className="font-medium">{staff.email}</p>
                                </div>
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Phone</span>
                                    </div>
                                    <p className="font-medium">{staff.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <Button
                                    variant="destructive"
                                    className="rounded-full"
                                    onClick={handleRemoveStaff}
                                >
                                    Remove Staff
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="permissions" className="space-y-6">
                        <div className="max-w-xl mx-auto space-y-6">
                            <h3 className="text-xl font-semibold mb-6">Enable Permissions</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-card border rounded-2xl">
                                    <span className="font-medium">Billing</span>
                                    <Switch
                                        checked={permissions.billing}
                                        onCheckedChange={() => handlePermissionChange('billing')}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-card border rounded-2xl">
                                    <span className="font-medium">Product Insight</span>
                                    <Switch
                                        checked={permissions.productInsight}
                                        onCheckedChange={() => handlePermissionChange('productInsight')}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-card border rounded-2xl">
                                    <span className="font-medium">Inventory</span>
                                    <Switch
                                        checked={permissions.inventory}
                                        onCheckedChange={() => handlePermissionChange('inventory')}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-card border rounded-2xl">
                                    <span className="font-medium">Reports</span>
                                    <Switch
                                        checked={permissions.reports}
                                        onCheckedChange={() => handlePermissionChange('reports')}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center mt-6">
                                <Button
                                    className="rounded-full"
                                    onClick={handleUpdatePermissions}
                                >
                                    Update Permissions
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}