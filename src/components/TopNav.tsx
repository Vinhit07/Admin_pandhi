import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOutlet } from '../context/OutletContext';

export const TopNav = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { outlets, outletId, selectOutlet } = useOutlet();
    const isSuperAdmin = user?.role === 'SUPERADMIN';

    // Determine active tab
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.startsWith('/outlets')) return 'outlet';
        if (path.startsWith('/onboarding')) return 'onboarding';
        if (path.startsWith('/admin-management')) return 'admin-management';
        return 'admin';
    };

    const activeTab = getActiveTab();

    const allTabs = [
        { id: 'admin', label: 'Admin', path: '/', icon: <LayoutDashboard size={18} /> },
        { id: 'outlet', label: 'Outlet', path: '/outlets', icon: <Store size={18} /> },
        { id: 'onboarding', label: 'Onboarding', path: '/onboarding', icon: <UserPlus size={18} /> },
        { id: 'admin-management', label: 'Admin Management', path: '/admin-management', icon: <Shield size={18} /> },
    ];

    const tabs = allTabs.filter(tab => {
        if (tab.id === 'admin') return true;
        // Only show other tabs if SuperAdmin
        return isSuperAdmin;
    });

    const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'ALL') {
            selectOutlet('ALL');
        } else {
            selectOutlet(Number(value));
        }
    };

    return (
        <div className="bg-card border-b border-border px-6 py-3 sticky top-0 z-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1">
                {/* Logo or Brand could go here */}
                {/* <div className="mr-8 font-bold text-xl flex items-center gap-2">
                    <span>⚡</span> <span>HungerBox Admin</span>
                </div> */}

                <nav className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            to={tab.path}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {/* Outlet Selector */}
                {/* Outlet Selector */}
                {!['/', '/outlets', '/onboarding', '/admin-management'].some(path => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))) && (
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <select
                            className="bg-transparent text-sm font-medium outline-none min-w-[120px] cursor-pointer"
                            value={outletId === null ? '' : String(outletId)}
                            onChange={handleOutletChange}
                            disabled={outlets.length === 0}
                        >
                            {/* "All Outlets" option hidden as per request */}
                            {/* {isSuperAdmin && <option value="ALL">All Outlets</option>} */}
                            {outlets.map(outlet => (
                                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* User Profile or other global controls can go here if removed from Sidebar */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {user?.name || 'User'}
                </div>
            </div>
        </div>
    );
};
