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
    ChevronLeft,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './theme-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface MenuItem {
    path: string
    label: string
    icon: React.ReactNode
}

const menuItems: MenuItem[] = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/reports-analytics', label: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
    { path: '/order-management', label: 'Order Management', icon: <ShoppingCart size={20} /> },
    { path: '/inventory-management', label: 'Inventory Management', icon: <Package size={20} /> },
    { path: '/product-management', label: 'Product Management', icon: <UtensilsCrossed size={20} /> },
    { path: '/customer-management', label: 'Customer Management', icon: <UserCog size={20} /> },
    { path: '/staff-management', label: 'Staff Management', icon: <Users size={20} /> },
    { path: '/expenditure-management', label: 'Expenditure Management', icon: <DollarSign size={20} /> },
    { path: '/wallet-management', label: 'Wallet Management', icon: <Wallet size={20} /> },
    { path: '/ticket-management', label: 'Ticket Management', icon: <Ticket size={20} /> },
    { path: '/notifications-management', label: 'Notifications', icon: <Bell size={20} /> },
    { path: '/app-management', label: 'App Settings', icon: <Settings size={20} /> },
]

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
    const location = useLocation()
    const { signOut } = useAuth()

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} flex flex-col h-full bg-card border-r-2 border-border/50 shadow-lg transition-all duration-300 z-40`}>
            {/* Collapse Toggle */}
            <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-border/50 h-16`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2 font-bold text-primary truncate">
                        <LayoutDashboard size={24} />
                        <span className="text-lg">Admin Controls</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <TooltipProvider delayDuration={0}>
                <nav className="overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                        const content = (
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''} ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md font-semibold'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <span className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                            </Link>
                        )

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {content}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-semibold">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            )
                        }

                        return <div key={item.path}>{content}</div>
                    })}
                </nav>
            </TooltipProvider>

            {/* Footer*/}
            <div className="px-3 py-2 border-t border-border/50 bg-muted/30 flex flex-col gap-2">
                <div className={`flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>
                    <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : 'justify-between w-full'}`}>
                        {isCollapsed ? (
                            <ThemeToggle />
                        ) : (
                            <div className="flex items-center justify-between w-full bg-muted/50 p-1 rounded-xl border border-border/50">
                                <span className="text-xs font-medium ml-2 text-muted-foreground">Dark mode</span>
                                <ThemeToggle />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => signOut()}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ${isCollapsed ? 'w-10 h-10 justify-center' : 'w-full text-sm font-semibold'}`}
                        title="Logout"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    )
}
