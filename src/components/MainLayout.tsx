import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export const MainLayout = () => {
    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <TopNav />
            <div className="flex-1 min-h-0 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};
