import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export const Layout = () => {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header userName="Admin User" />
                <main className="flex-1 p-6 overflow-auto">
                    {/* Rounded rectangle container for page content */}
                    <div className="bg-card border-2 border-border rounded-3xl p-8 h-full shadow-lg">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
