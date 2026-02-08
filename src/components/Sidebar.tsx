import { Link, useLocation } from 'react-router-dom'
import {
    Home,
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    Wallet,
    UserCog,
    Ticket,
    Bell,
    UtensilsCrossed,
    Settings,
    BarChart3,
    LogOut,
    Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface MenuItem {
    path: string
    label: string
    icon: React.ReactNode
}

const menuItems: MenuItem[] = [
    { path: '/', label: 'Home', icon: <Home size={22} /> },
    { path: '/order-management', label: 'Order Management', icon: <ShoppingCart size={22} /> },
    { path: '/staff-management', label: 'Staff Management', icon: <Users size={22} /> },
    { path: '/inventory-management', label: 'Inventory Management', icon: <Package size={22} /> },
    { path: '/expenditure-management', label: 'Expenditure Management', icon: <DollarSign size={22} /> },
    { path: '/wallet-management', label: 'Wallet Management', icon: <Wallet size={22} /> },
    { path: '/customer-management', label: 'Customer Management', icon: <UserCog size={22} /> },
    { path: '/ticket-management', label: 'Ticket Management', icon: <Ticket size={22} /> },
    { path: '/notifications-management', label: 'Notifications Management', icon: <Bell size={22} /> },
    { path: '/product-management', label: 'Product Management', icon: <UtensilsCrossed size={22} /> },
    { path: '/app-management', label: 'App Management', icon: <Settings size={22} /> },
    { path: '/reports-analytics', label: 'Reports & Analytics', icon: <BarChart3 size={22} /> },
]

export const Sidebar = () => {
    const location = useLocation()
    const { signOut } = useAuth()

    return (
        <aside className="flex flex-col items-center p-4 h-screen sticky top-0 gap-4">
            {/* First pill - 12 page navigation icons */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-full flex flex-col items-center py-6 px-3 shadow-lg overflow-y-auto min-h-0 no-scrollbar">
                <nav className="flex flex-col items-center gap-3 w-full">
                    {menuItems.filter(item => {
                        return true;
                    }).map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={item.label}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md scale-110'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:scale-105'
                                    }`}
                            >
                                {item.icon}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="bg-sidebar border-2 border-sidebar-border rounded-full flex flex-col items-center py-4 px-3 shadow-lg gap-3 shrink-0">
                <button
                    title="Info"
                    onClick={() => window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50 hover:scale-105 transition-all duration-200"
                >
                    <Info size={22} />
                </button>
                <button
                    title="Logout"
                    onClick={() => signOut()}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground hover:scale-110 transition-all duration-200"
                >
                    <LogOut size={22} />
                </button>
            </div>
        </aside>
    )
}
