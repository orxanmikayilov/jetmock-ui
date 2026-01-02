'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
            else setIsSidebarCollapsed(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const mainContentMargin = isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-20' : 'ml-64');

    return (
        <div className="flex min-h-screen antialiased">

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />

            {isMobile && (
                <div className="fixed top-0 left-0 right-0 h-16 bg-[#0d0e16] border-b border-indigo-500/10 flex items-center px-6 z-30">
                    <button onClick={toggleSidebar} className="text-zinc-400 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-black text-white tracking-tight">Mock Architect</span>
                </div>
            )}

            <main
                className={`flex-1 ${mainContentMargin} transition-all duration-300 min-h-screen ${isMobile ? 'pt-16' : ''}`}
            >
                {children}
            </main>
        </div>
    );
}