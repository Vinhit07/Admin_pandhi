import { useState } from "react"
import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Permission {
    id: string
    name: string
    enabled: boolean
}

export const AppManagement = () => {
    // Mobile App Permissions
    const [permissions, setPermissions] = useState<Permission[]>([
        { id: "app", name: "App", enabled: true },
        { id: "upi", name: "UPI", enabled: true },
        { id: "live_counter", name: "Live Counter", enabled: true },
        { id: "coupons", name: "Coupons", enabled: true },
    ])

    // Preorder Calendar State
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 26)) // January 2026
    const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())

    const togglePermission = (id: string) => {
        setPermissions(permissions.map(p =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
        ))
    }

    const handleUpdateDetails = () => {
        // Save permissions or calendar settings
        console.log("Updating details...")
    }

    // Calendar helpers
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay()
    }

    const formatDateKey = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const isDateInPast = (year: number, month: number, day: number) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const checkDate = new Date(year, month, day)
        return checkDate < today
    }

    const toggleDate = (day: number) => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        if (isDateInPast(year, month, day)) return

        const dateKey = formatDateKey(year, month, day)
        const newUnavailable = new Set(unavailableDates)

        if (newUnavailable.has(dateKey)) {
            newUnavailable.delete(dateKey)
        } else {
            newUnavailable.add(dateKey)
        }

        setUnavailableDates(newUnavailable)
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    const renderCalendar = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)
        const days = []

        // Empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />)
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = formatDateKey(year, month, day)
            const isUnavailable = unavailableDates.has(dateKey)
            const isPast = isDateInPast(year, month, day)
            const isToday = day === 26 && month === 0 && year === 2026

            days.push(
                <div
                    key={day}
                    onClick={() => !isPast && toggleDate(day)}
                    className={`
                        h-10 flex items-center justify-center rounded-md text-sm cursor-pointer
                        transition-colors border
                        ${isPast ? 'text-muted-foreground cursor-not-allowed bg-muted/30' : ''}
                        ${isUnavailable && !isPast ? 'bg-red-100 text-red-600 border-red-200' : 'border-border hover:bg-muted/50'}
                        ${isToday ? 'border-primary border-2 font-semibold' : ''}
                    `}
                >
                    {day}
                </div>
            )
        }

        return days
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">App Management</h1>
            </div>

            {/* Tabs Container - same style as Expenditure Management */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="mobile" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="mobile">Mobile App</TabsTrigger>
                        <TabsTrigger value="preorder">Preorder Settings</TabsTrigger>
                    </TabsList>

                    {/* Mobile App Tab */}
                    <TabsContent value="mobile" className="space-y-6">
                        <h2 className="text-lg font-semibold">Mobile App Permission</h2>

                        <div className="space-y-4">
                            {permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                                >
                                    <span className="text-foreground font-medium">{permission.name}</span>
                                    <Switch
                                        checked={permission.enabled}
                                        onCheckedChange={() => togglePermission(permission.id)}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleUpdateDetails}
                                className="bg-primary hover:bg-primary/90"
                            >
                                Update Details
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Preorder Settings Tab */}
                    <TabsContent value="preorder" className="space-y-6">
                        <h2 className="text-lg font-semibold">Preorder Settings - Non-Availability Management</h2>

                        {/* Calendar Header */}
                        <div className="flex items-center justify-between max-w-lg mx-auto">
                            <button
                                onClick={prevMonth}
                                className="p-2 hover:bg-muted rounded-md transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-lg font-medium">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-muted rounded-md transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="max-w-lg mx-auto">
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>
                        </div>

                        {/* Instructions */}
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            Select dates <span className="text-red-500">that should be marked as non-available (red dates)</span>. Past dates cannot be selected. All time slots will be marked as unavailable for selected dates.
                        </p>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleUpdateDetails}
                                className="bg-primary hover:bg-primary/90"
                            >
                                Update Details
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
