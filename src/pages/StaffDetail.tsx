import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Switch } from "../components/ui/switch"
import { ArrowLeft, User, Mail, Phone, Briefcase } from "lucide-react"
import { useState } from "react"

interface StaffDetail {
    id: string
    name: string
    email: string
    phone: string
    position: string
    permissions: {
        billing: boolean
        productInsight: boolean
        inventory: boolean
        reports: boolean
    }
}

const mockStaffData: Record<string, StaffDetail> = {
    "1": {
        id: "1",
        name: "Tharini",
        email: "tharinimohan@gmail.com",
        phone: "+91(33)914400",
        position: "Manager",
        permissions: { billing: true, productInsight: true, inventory: true, reports: true }
    },
    "2": {
        id: "2",
        name: "Staff",
        email: "staff@gmail.com",
        phone: "9899234450",
        position: "Trainee",
        permissions: { billing: false, productInsight: true, inventory: true, reports: false }
    },
    "3": {
        id: "3",
        name: "John Doe",
        email: "john.doe@gmail.com",
        phone: "+91(98)765432",
        position: "Chef",
        permissions: { billing: false, productInsight: false, inventory: true, reports: false }
    },
    "4": {
        id: "4",
        name: "Jane Smith",
        email: "jane.smith@gmail.com",
        phone: "+91(87)654321",
        position: "Supervisor",
        permissions: { billing: true, productInsight: true, inventory: true, reports: true }
    },
}

export const StaffDetail = () => {
    const { staffId } = useParams<{ staffId: string }>()
    const navigate = useNavigate()
    const staff = staffId ? mockStaffData[staffId] : null

    const [permissions, setPermissions] = useState(staff?.permissions || {
        billing: false,
        productInsight: false,
        inventory: false,
        reports: false,
    })

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

    const handlePermissionChange = (permission: keyof typeof permissions) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }))
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button
                variant="outline"
                onClick={() => navigate("/staff-management")}
                className="rounded-full"
            >
                <ArrowLeft size={18} className="mr-2" />
                Back
            </Button>

            {/* Tabs Container */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="details">Staff Details</TabsTrigger>
                        <TabsTrigger value="permissions">Permission</TabsTrigger>
                    </TabsList>

                    {/* Staff Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Avatar */}
                            <Avatar className="w-32 h-32">
                                <AvatarFallback className="bg-muted text-muted-foreground text-4xl">
                                    <User size={60} />
                                </AvatarFallback>
                            </Avatar>

                            {/* Staff Name */}
                            <h2 className="text-2xl font-bold">{staff.name}</h2>

                            {/* Staff Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                                {/* Name */}
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Name</span>
                                    </div>
                                    <p className="font-medium">{staff.name}</p>
                                </div>

                                {/* Position */}
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Briefcase size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Position</span>
                                    </div>
                                    <p className="font-medium">{staff.position}</p>
                                </div>

                                {/* Email */}
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Email</span>
                                    </div>
                                    <p className="font-medium">{staff.email}</p>
                                </div>

                                {/* Phone */}
                                <div className="bg-card border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Phone size={18} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Phone</span>
                                    </div>
                                    <p className="font-medium">{staff.phone}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-6">
                                <Button className="rounded-full">Update Details</Button>
                                <Button variant="destructive" className="rounded-full">Remove Staff</Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-6">
                        <div className="max-w-xl mx-auto space-y-6">
                            <h3 className="text-xl font-semibold mb-6">Enable Permissions</h3>

                            {/* Permission Toggles */}
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

                            {/* Update Button */}
                            <div className="flex justify-center mt-6">
                                <Button className="rounded-full">Update Permissions</Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
