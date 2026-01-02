'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    // Desktop-da default açıq, Mobile-da default bağlı
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Ekran ölçüsünü izləmək üçün
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768; // 768px-dən kiçikdirsə mobile sayılır
            setIsMobile(mobile);
            // Mobile-a keçəndə avtomatik bağlayaq (user experience üçün)
            if (mobile) setIsSidebarCollapsed(true);
            else setIsSidebarCollapsed(false);
        };

        // İlk yüklənmədə yoxla
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Main Content Margin Hesablaması
    // Mobile: margin yoxdur (overlay). Desktop: 80px (collapsed) və ya 256px (open).
    const mainContentMargin = isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-20' : 'ml-64');

    return (
        <div className="flex min-h-screen bg-[#0b1121]">
            {/* Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />

            {/* Mobile Header (Hamburger Menu) */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-gray-800 flex items-center px-4 z-30">
                    <button onClick={toggleSidebar} className="text-white p-2">
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-white">Mock Server</span>
                </div>
            )}

            {/* Main Content Area */}
            <main
                className={`flex-1 ${mainContentMargin} transition-all duration-300 p-8 h-screen overflow-y-auto ${isMobile ? 'pt-20' : ''}`}
            >
                {children}
            </main>
        </div>
    );
}