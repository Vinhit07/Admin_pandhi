import { useState } from "react"
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

interface ScheduledNotification {
    title: string
    message: string
    priority: string
    scheduledAt: string
    status: string
}

interface Coupon {
    code: string
    description: string
    reward: string
    minOrder: string
    validUntil: string
    usage: string
}

const mockNotifications: ScheduledNotification[] = [
    { title: "scheduled", message: "testing", priority: "HIGH", scheduledAt: "12/4/2025, 6:12:00 PM", status: "Sent" },
]

const mockCoupons: Coupon[] = [
    { code: "TEST100", description: "This is for testing", reward: "10%", minOrder: "₹200", validUntil: "1/11/2026", usage: "2/988" },
    { code: "SAVE75", description: "75% offer", reward: "75%", minOrder: "₹100", validUntil: "12/28/2025", usage: "1/1000" },
    { code: "HAPPY-HOURS", description: "25% Off on all orders above 100", reward: "25%", minOrder: "₹100", validUntil: "12/22/2025", usage: "3/200" },
    { code: "HAPPY50", description: "Order and get 50% off", reward: "50%", minOrder: "₹10", validUntil: "12/15/2025", usage: "1/200" },
]

export const NotificationsManagement = () => {
    const [showCreateNotification, setShowCreateNotification] = useState(false)
    const [showCreateCoupon, setShowCreateCoupon] = useState(false)

    // Notification form states
    const [notifTitle, setNotifTitle] = useState("")
    const [notifPriority, setNotifPriority] = useState("")
    const [notifMessage, setNotifMessage] = useState("")
    const [notifScheduleDate, setNotifScheduleDate] = useState("dd-mm-yyyy")
    const [notifScheduleTime, setNotifScheduleTime] = useState("--:-- --")

    // Promotion form states
    const [promoTitle, setPromoTitle] = useState("")
    const [promoPriority, setPromoPriority] = useState("")
    const [promoDescription, setPromoDescription] = useState("")
    const [promoScheduleDate, setPromoScheduleDate] = useState("dd-mm-yyyy")
    const [promoScheduleTime, setPromoScheduleTime] = useState("--:-- --")

    // Coupon form states
    const [couponCode, setCouponCode] = useState("")
    const [rewardValue, setRewardValue] = useState("")
    const [couponDescription, setCouponDescription] = useState("")
    const [minOrderValue, setMinOrderValue] = useState("")
    const [usageLimit, setUsageLimit] = useState("")
    const [validFrom, setValidFrom] = useState("dd-mm-yyyy --:-- --")
    const [validUntil, setValidUntil] = useState("dd-mm-yyyy --:-- --")
    const [autoSendNotif, setAutoSendNotif] = useState(false)

    // Notification Columns
    const notificationColumns: ColumnDef<ScheduledNotification>[] = [
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
        },
        {
            accessorKey: "priority",
            header: "PRIORITY",
            cell: ({ row }) => (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    {row.getValue("priority")}
                </Badge>
            ),
        },
        {
            accessorKey: "scheduledAt",
            header: "SCHEDULED AT",
        },
        {
            accessorKey: "status",
            header: "STATUS",
            cell: ({ row }) => (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {row.getValue("status")}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: () => (
                <Button size="sm" variant="destructive" className="rounded-full">
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
            accessorKey: "description",
            header: "DESCRIPTION",
        },
        {
            accessorKey: "reward",
            header: "REWARD",
            cell: ({ row }) => (
                <span className="font-semibold">{row.getValue("reward")}</span>
            ),
        },
        {
            accessorKey: "minOrder",
            header: "MIN ORDER",
        },
        {
            accessorKey: "validUntil",
            header: "VALID UNTIL",
        },
        {
            accessorKey: "usage",
            header: "USAGE",
        },
        {
            id: "actions",
            header: "ACTIONS",
            cell: () => (
                <Button size="sm" variant="destructive" className="rounded-full">
                    Remove
                </Button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="bg-sidebar border-2 border-sidebar-border rounded-3xl p-6 shadow-lg">
                <Tabs defaultValue="notifications" className="w-full">
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
                                    <DataTable columns={notificationColumns} data={mockNotifications} />
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
                                            <label className="text-sm font-medium">Priority Type *</label>
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
                                            <label className="text-sm font-medium">Image Upload</label>
                                            <Input type="file" className="rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Schedule Date</label>
                                            <Input
                                                type="text"
                                                value={notifScheduleDate}
                                                onChange={(e) => setNotifScheduleDate(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Schedule Time</label>
                                            <Input
                                                type="text"
                                                value={notifScheduleTime}
                                                onChange={(e) => setNotifScheduleTime(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-6">
                                        <Button variant="destructive" className="rounded-full">Cancel</Button>
                                        <Button variant="outline" className="rounded-full">Send Now</Button>
                                        <Button className="rounded-full bg-green-600 hover:bg-green-700">Schedule</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Promotion Tab */}
                    <TabsContent value="promotion" className="space-y-6">
                        <div className="bg-card border-2 border-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold mb-6">Promotion Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        placeholder="Enter title"
                                        value={promoTitle}
                                        onChange={(e) => setPromoTitle(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority Type</label>
                                    <Select value={promoPriority} onValueChange={setPromoPriority}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        placeholder="Enter description"
                                        value={promoDescription}
                                        onChange={(e) => setPromoDescription(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image Upload</label>
                                    <Input type="file" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Schedule Date</label>
                                    <Input
                                        type="text"
                                        value={promoScheduleDate}
                                        onChange={(e) => setPromoScheduleDate(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Schedule Time</label>
                                    <Input
                                        type="text"
                                        value={promoScheduleTime}
                                        onChange={(e) => setPromoScheduleTime(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <Button variant="destructive" className="rounded-full">Reset</Button>
                                <Button className="rounded-full bg-green-600 hover:bg-green-700">Send Promotion</Button>
                            </div>
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
                                    <DataTable columns={couponColumns} data={mockCoupons} />
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
                                                placeholder="e.g., 100"
                                                value={minOrderValue}
                                                onChange={(e) => setMinOrderValue(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Usage Limit *</label>
                                            <Input
                                                placeholder="e.g., 100"
                                                value={usageLimit}
                                                onChange={(e) => setUsageLimit(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Valid From *</label>
                                            <Input
                                                type="text"
                                                value={validFrom}
                                                onChange={(e) => setValidFrom(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Valid Until *</label>
                                            <Input
                                                type="text"
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
                                        <Button variant="destructive" className="rounded-full">Cancel</Button>
                                        <Button className="rounded-full bg-green-600 hover:bg-green-700">Create Coupon</Button>
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
