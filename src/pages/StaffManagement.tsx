import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Mail, Phone, Briefcase, User, Loader2 } from "lucide-react"
import { useOutlet } from "../context/OutletContext"
import { staffService } from "../services"

interface Staff {
    id: number
    name: string
    email: string
    phone?: string
    position?: string
}

export const StaffManagement = () => {
    const navigate = useNavigate()
    const { outletId } = useOutlet()

    const [staffList, setStaffList] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (outletId) {
            fetchStaff()
        }
    }, [outletId])

    const fetchStaff = async () => {
        if (!outletId) return

        try {
            setLoading(true)
            const response = await staffService.getStaffs(outletId)
            setStaffList(response.data || [])
        } catch (error) {
            console.error('Error fetching staff:', error)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const handleStaffClick = (staffId: number) => {
        navigate(`/staff-management/${staffId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffList.map((staff) => (
                    <Card
                        key={staff.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 rounded-3xl border-2"
                        onClick={() => handleStaffClick(staff.id)}
                    >
                        <CardContent className="p-6">
                            {/* Avatar */}
                            <div className="flex justify-center mb-4">
                                <Avatar className="w-24 h-24">
                                    <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                                        <User size={40} />
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Staff Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-muted-foreground" />
                                    <span className="font-semibold text-lg">{staff.name}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{staff.email}</span>
                                </div>

                                {staff.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{staff.phone}</span>
                                    </div>
                                )}

                                {staff.position && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-muted-foreground" />
                                        <span className="text-sm font-medium">{staff.position}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {staffList.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <User className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">No staff members found</p>
                </div>
            )}
        </div>
    )
}
