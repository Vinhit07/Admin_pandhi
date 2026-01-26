import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Mail, Phone, Briefcase, User } from "lucide-react"

interface Staff {
    id: string
    name: string
    email: string
    phone: string
    position: string
}

const mockStaff: Staff[] = [
    { id: "1", name: "Tharini", email: "tharinimohan@gmail.com", phone: "+91(33)914400", position: "Manager" },
    { id: "2", name: "Staff", email: "staff@gmail.com", phone: "9899234450", position: "Trainee" },
    { id: "3", name: "John Doe", email: "john.doe@gmail.com", phone: "+91(98)765432", position: "Chef" },
    { id: "4", name: "Jane Smith", email: "jane.smith@gmail.com", phone: "+91(87)654321", position: "Supervisor" },
]

export const StaffManagement = () => {
    const navigate = useNavigate()

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const handleStaffClick = (staffId: string) => {
        navigate(`/staff-management/${staffId}`)
    }

    return (
        <div className="space-y-6">
            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockStaff.map((staff) => (
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

                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{staff.phone}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} className="text-muted-foreground" />
                                    <span className="text-sm font-medium">{staff.position}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
