import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-full bg-background overflow-hidden">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div className={`flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300`}>
                <main className="flex-1 p-8 overflow-auto bg-muted/20">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
