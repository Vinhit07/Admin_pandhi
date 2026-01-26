import { Avatar, AvatarFallback } from "./ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import { useLocation } from "react-router-dom"

interface HeaderProps {
    userName?: string
}

// Map routes to page titles
const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/order-management': 'Order Management',
    '/staff-management': 'Staff Management',
    '/inventory-management': 'Inventory Management',
    '/expenditure-management': 'Expenditure Management',
    '/wallet-management': 'Wallet Management',
    '/customer-management': 'Customer Management',
    '/ticket-management': 'Ticket Management',
    '/notifications-management': 'Notifications Management',
    '/product-management': 'Product Management',
    '/app-management': 'App Management',
    '/reports-analytics': 'Reports & Analytics',
}

export const Header = ({ userName = "Admin User" }: HeaderProps) => {
    const location = useLocation()

    // Get initials from user name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // Get current page title
    const currentPageTitle = pageTitles[location.pathname] || 'Dashboard'

    return (
        <header className="px-6 py-4 flex items-center justify-between">
            {/* Logo Section - Pill shaped */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">H</span>
                </div>
                <div>
                    <h1 className="font-bold text-foreground text-lg">HungerBox Admin</h1>
                </div>
            </div>

            <div className="bg-sidebar border-2 border-sidebar-border rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
                {/* Page Title in Center - No pill */}
                <div className="flex-1 flex justify-center">
                    <h2 className="text-xl font-semibold text-foreground">{currentPageTitle}</h2>
                </div>
            </div>

            {/* User Section - Pill shaped */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-full px-6 py-3 flex items-center gap-4 shadow-lg">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{userName}</p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                    <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(userName)}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header >
    )
}
