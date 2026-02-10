import { useState, useEffect } from "react"
import { formatDate, formatDateTime } from "../lib/dateUtils"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"
import { DataTable } from "../components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Textarea } from "../components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useOutlet } from "../context/OutletContext"
import { notificationService } from "../services"
import type { NotificationSchedule, Coupon } from "../types/api"
import toast from "react-hot-toast"

export const NotificationsManagement = () => {
    const { outletId } = useOutlet()

    const [activeTab, setActiveTab] = useState("notifications")
    const [showCreateNotification, setShowCreateNotification] = useState(false)
    const [showCreateCoupon, setShowCreateCoupon] = useState(false)

    const [notifications, setNotifications] = useState<NotificationSchedule[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)

    // Notification form states
    const [notifTitle, setNotifTitle] = useState("")
    const [notifPriority, setNotifPriority] = useState("")
    const [notifMessage, setNotifMessage] = useState("")
    const [notifScheduleDate, setNotifScheduleDate] = useState("")
    const [notifScheduleTime, setNotifScheduleTime] = useState("")

    // Promotion form states (similar structure)
    const [promoTitle, setPromoTitle] = useState("")
    const [promoPriority, setPromoPriority] = useState("")
    const [promoDescription, setPromoDescription] = useState("")
    const [promoScheduleDate, setPromoScheduleDate] = useState("")
    const [promoScheduleTime, setPromoScheduleTime] = useState("")

    // Coupon form states
    const [couponCode, setCouponCode] = useState("")
    const [rewardValue, setRewardValue] = useState("")
    const [couponDescription, setCouponDescription] = useState("")
    const [minOrderValue, setMinOrderValue] = useState("")
    const [usageLimit, setUsageLimit] = useState("")
    const [validFrom, setValidFrom] = useState("")
    const [validUntil, setValidUntil] = useState("")
    const [autoSendNotif, setAutoSendNotif] = useState(false)

    useEffect(() => {
        if (outletId) {
            fetchData()
        }
    }, [outletId])

    const fetchData = async () => {
        if (!outletId) return
        try {
            setLoading(true)
            const [notifRes, couponRes] = await Promise.all([
                notificationService.getScheduledNotifications(outletId),
                notificationService.getCoupons(outletId)
            ])

            console.log("📋 Coupon Response:", couponRes)
            console.log("📋 Coupon Response.data:", couponRes.data)

            if (notifRes.success && notifRes.data) {
                setNotifications(Array.isArray(notifRes.data) ? notifRes.data : [])
            }
            if (couponRes.data) {
                // Handle both nested and non-nested response structures
                const couponData = Array.isArray(couponRes.data)
                    ? couponRes.data
                    : (couponRes.data?.data || [])
                console.log("📋 Setting coupons to:", couponData)
                setCoupons(couponData)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleScheduleNotification = async () => {
        if (!notifTitle || !notifMessage || !outletId) {
            toast.error("Please fill in required fields")
            return
        }

        try {
            const response = await notificationService.scheduleNotification({
                title: notifTitle,
                message: notifMessage,
                targetAudience: 'ALL',
                scheduledDate: notifScheduleDate,
                scheduledTime: notifScheduleTime + ":00",
                outletId: typeof outletId === 'string' ? parseInt(outletId) : outletId,
                priority: notifPriority || "MEDIUM",
            })

            if (response.success) {
                toast.success("Notification scheduled successfully")
                setShowCreateNotification(false)
                fetchData()
                // Reset form
                setNotifTitle("")
                setNotifMessage("")
                setNotifPriority("")
                setNotifScheduleDate("")
                setNotifScheduleTime("")
            } else {
                toast.error(response.message || "Failed to schedule notification")
            }
        } catch (error: any) {
            console.error("Error scheduling notification:", error)
            toast.error(error?.message || "Failed to schedule notification")
        }
    }

    const handleCreateCoupon = async () => {
        if (!couponCode || !rewardValue || !validFrom || !validUntil || !usageLimit || !outletId) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            // Convert datetime-local format to RFC3339 (add :00Z for timezone)
            const validFromRFC3339 = validFrom ? `${validFrom}:00Z` : '';
            const validUntilRFC3339 = validUntil ? `${validUntil}:00Z` : '';

            await notificationService.createCoupon({
                code: couponCode,
                rewardValue: `${rewardValue}%`, // Backend expects string with % symbol
                minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
                validFrom: validFromRFC3339,
                validUntil: validUntilRFC3339,
                usageLimit: parseInt(usageLimit),
                outletId: typeof outletId === 'string' ? parseInt(outletId) : outletId
            })

            toast.success("Coupon created successfully")
            setShowCreateCoupon(false)
            // Reset form
            setCouponCode("")
            setRewardValue("")
            setCouponDescription("")
            setMinOrderValue("")
            setUsageLimit("")
            setValidFrom("")
            setValidUntil("")
            setAutoSendNotif(false)
            // Always refresh data
            await fetchData()
        } catch (error: any) {
            console.error("Error creating coupon:", error)
            toast.error(error?.message || "Failed to create coupon")
        }
    }

    const handleDeleteNotification = async (id: number) => {
        try {
            await notificationService.cancelNotification(id)
            toast.success("Notification deleted successfully")
            await fetchData()
        } catch (error) {
            console.error("Error deleting notification:", error)
            toast.error("Failed to delete notification")
        }
    }

    const handleDeleteCoupon = async (id: number) => {
        if (!confirm("Are you sure you want to delete this coupon?")) {
            return
        }

        try {
            await notificationService.deleteCoupon(id)
            toast.success("Coupon deleted successfully")
            await fetchData()
        } catch (error) {
            console.error("Error deleting coupon:", error)
            toast.error("Failed to delete coupon")
        }
    }

    // Notification Columns
    const notificationColumns: ColumnDef<NotificationSchedule>[] = [
        {
            accessorKey: "title",
            header: "TITLE",
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue("title")}</span>
            ),
        },
        {
            accessorKey: "message",
            header: "MESSAGE",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.getValue("message")}>
                    {row.getValue("message")}
                </div>
            ),
        },
        {
            accessorKey: "priority",
            header: "PRIORITY",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as string
                const priorityColors = {
                    high: "bg-red-100 text-red-800 hover:bg-red-100",
                    medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    low: "bg-blue-100 text-blue-800 hover:bg-blue-100"
                }
                return (
                    <Badge className={priorityColors[priority?.toLowerCase() as keyof typeof priorityColors] || "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                        {priority?.toUpperCase() || 'N/A'}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "SCHEDULED AT",
            cell: ({ row }) => formatDateTime(row.getValue("createdAt"))
        },
        {
            accessorKey: "isSent",
            header: "STATUS",
            cell: ({ row }) => {
                const isSent = row.getValue("isSent") as boolean
                const variant = isSent ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                return (
                    <Badge className={`${variant} hover:${variant}`}>
                        {isSent ? "SENT" : "NOT SENT"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => handleDeleteNotification(row.original.id)}
                    disabled={row.original.status === 'SENT'}
                >
                    Delete
                </Button>
            ),
        },
    ]

    // Coupon Columns
    const couponColumns: ColumnDef<Coupon>[] = [
        {
            accessorKey: "code",
            header: "CODE",
            cell: ({ row }) => (
                <span className="font-medium text-primary">{row.getValue("code")}</span>
            ),
        },
        {
            accessorKey: "rewardValue",
            header: "REWARD",
            cell: ({ row }) => {
                const value = row.getValue("rewardValue"); // e.g. 0.15

                return (
                    <span className="font-semibold">
                        {value * 100}%
                    </span>
                );
            },
        },
        {
            accessorKey: "minOrderValue",
            header: "MIN ORDER",
            cell: ({ row }) => `₹${row.getValue("minOrderValue") || 0}`
        },
        {
            accessorKey: "validUntil",
            header: "VALID UNTIL",
            cell: ({ row }) => formatDate(row.getValue("validUntil"))
        },
        {
            accessorKey: "usedCount",
            header: "USAGE",
            cell: ({ row }) => `${row.original.usedCount}/${row.original.usageLimit}`
        },
        {
            accessorKey: "isActive",
            header: "STATUS",
            cell: ({ row }) => (
                <Badge className={row.getValue("isActive") ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                    {row.getValue("isActive") ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => handleDeleteCoupon(row.original.id)}
                >
                    Remove
                </Button>
            ),
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="promotion">Promotion</TabsTrigger>
                        <TabsTrigger value="coupons">Coupons</TabsTrigger>
                    </TabsList>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        {!showCreateNotification ? (
                            <>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => setShowCreateNotification(true)}
                                        className="rounded-full bg-green-600 hover:bg-green-700"
                                    >
                                        Create Notification
                                    </Button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Scheduled Notification</h3>
                                    <DataTable columns={notificationColumns} data={notifications} />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold">Create Notification</h3>
                                    <Button variant="outline" onClick={() => setShowCreateNotification(false)} className="rounded-full">
                                        Back
                                    </Button>
                                </div>
                                <div className="bg-card border-2 border-border rounded-3xl p-6">
                                    <h4 className="text-lg font-semibold mb-6">Create Notification</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title *</label>
                                            <Input
                                                placeholder="Enter notification title"
                                                value={notifTitle}
                                                onChange={(e) => setNotifTitle(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Priority Type</label>
                                            <Select value={notifPriority} onValueChange={setNotifPriority}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Select Priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium">Message *</label>
                                            <Textarea
                                                placeholder="Enter notification message"
                                                value={notifMessage}
                                                onChange={(e) => setNotifMessage(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Schedule Date</label>
                                            <Input
                                                type="date"
                                                value={notifScheduleDate}
                                                onChange={(e) => setNotifScheduleDate(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Schedule Time</label>
                                            <Input
                                                type="time"
                                                value={notifScheduleTime}
                                                onChange={(e) => setNotifScheduleTime(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <Button variant="destructive" onClick={() => setShowCreateNotification(false)} className="rounded-full">Cancel</Button>
                                        <Button onClick={handleScheduleNotification} className="rounded-full bg-green-600 hover:bg-green-700">Schedule</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Promotion Tab - Similar to notification but simplified */}
                    <TabsContent value="promotion" className="space-y-6">
                        <div className="bg-card border-2 border-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold mb-6">Promotion Details</h3>
                            <p className="text-muted-foreground text-sm mb-4">Use the notifications tab to send promotional messages</p>
                        </div>
                    </TabsContent>

                    {/* Coupons Tab */}
                    <TabsContent value="coupons" className="space-y-6">
                        {!showCreateCoupon ? (
                            <>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => setShowCreateCoupon(true)}
                                        className="rounded-full bg-green-600 hover:bg-green-700"
                                    >
                                        Create Coupon
                                    </Button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Active Coupons</h3>
                                    <DataTable columns={couponColumns} data={coupons} />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold">Create Coupon</h3>
                                    <Button variant="outline" onClick={() => setShowCreateCoupon(false)} className="rounded-full">
                                        Back
                                    </Button>
                                </div>
                                <div className="bg-card border-2 border-border rounded-3xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Coupon Code *</label>
                                            <Input
                                                placeholder="e.g., SAVE20"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Reward Value % *</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 20"
                                                value={rewardValue}
                                                onChange={(e) => setRewardValue(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium">Description</label>
                                            <Textarea
                                                placeholder="Describe your coupon offer"
                                                value={couponDescription}
                                                onChange={(e) => setCouponDescription(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Minimum Order Value ₹</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 100"
                                                value={minOrderValue}
                                                onChange={(e) => setMinOrderValue(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Usage Limit *</label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 100"
                                                value={usageLimit}
                                                onChange={(e) => setUsageLimit(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Valid From *</label>
                                            <Input
                                                type="datetime-local"
                                                value={validFrom}
                                                onChange={(e) => setValidFrom(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Valid Until *</label>
                                            <Input
                                                type="datetime-local"
                                                value={validUntil}
                                                onChange={(e) => setValidUntil(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={autoSendNotif}
                                                    onCheckedChange={setAutoSendNotif}
                                                />
                                                <label className="text-sm font-medium">Auto Send Notification</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <Button variant="destructive" onClick={() => setShowCreateCoupon(false)} className="rounded-full">Cancel</Button>
                                        <Button onClick={handleCreateCoupon} className="rounded-full bg-green-600 hover:bg-green-700">Create Coupon</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
