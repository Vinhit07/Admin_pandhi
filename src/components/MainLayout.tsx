import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <TopNav />
            <div className="flex-1 overflow-hidden">
                <Outlet />
            </div>
        </div>
    );
};
