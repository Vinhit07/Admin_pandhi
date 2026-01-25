import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Avatar, AvatarFallback } from "./components/ui/avatar"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table"
import { ThemeToggle } from "./components/theme-toggle"

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Sample data for the table
  const orders = [
    { id: "ORD-001", customer: "John Doe", status: "Delivered", amount: "$45.00", date: "2026-01-20" },
    { id: "ORD-002", customer: "Jane Smith", status: "Pending", amount: "$32.50", date: "2026-01-21" },
    { id: "ORD-003", customer: "Mike Johnson", status: "Processing", amount: "$78.00", date: "2026-01-22" },
    { id: "ORD-004", customer: "Sarah Williams", status: "Delivered", amount: "$56.25", date: "2026-01-23" },
    { id: "ORD-005", customer: "Tom Brown", status: "Cancelled", amount: "$23.00", date: "2026-01-24" },
  ]

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Delivered": "default",
      "Pending": "secondary",
      "Processing": "outline",
      "Cancelled": "destructive"
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">A</span>
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Dashboard v2.0</p>
          </div>
        </div>

        <nav className="space-y-2">
          {['dashboard', 'orders', 'customers', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors capitalize ${activeTab === tab
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-sidebar-border">
          <Button variant="outline" className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline">Export</Button>
            <Button>New Order</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl text-primary">$12,345</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Orders</CardDescription>
              <CardTitle className="text-3xl text-secondary">156</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+12 new today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Customers</CardDescription>
              <CardTitle className="text-3xl">2,345</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+180 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg. Order Value</CardDescription>
              <CardTitle className="text-3xl">$52.80</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">+5.2% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {orders.length} orders in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your recent orders.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right font-semibold">{order.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Most active this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Alice Cooper", orders: 12, avatar: "AC" },
                { name: "Bob Martin", orders: 9, avatar: "BM" },
                { name: "Carol White", orders: 8, avatar: "CW" },
                { name: "David Lee", orders: 7, avatar: "DL" },
              ].map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {customer.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{customer.orders}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="default">Create New Order</Button>
              <Button className="w-full" variant="outline">Add Customer</Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-secondary">Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="secondary">Sales Report</Button>
              <Button className="w-full" variant="outline">Analytics</Button>
            </CardContent>
          </Card>

          <Card className="border-accent">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Server</span>
                <Badge>Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge>Healthy</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App
