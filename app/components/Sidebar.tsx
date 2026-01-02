// components/Sidebar.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Settings, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, isMobile }) => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Mock Groups', href: '/', icon: <Layers size={20} /> },
        { name: 'Settings', href: '/settings', icon: <Settings size={20} /> }
    ];

    // Sidebar eni
    const sidebarWidthClass = isMobile
        ? (isCollapsed ? '-translate-x-full' : 'translate-x-0 w-64')
        : (isCollapsed ? 'w-20' : 'w-64');

    return (
        <>
            {/* MOBILE OVERLAY */}
            {isMobile && !isCollapsed && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />
            )}

            <aside className={`fixed left-0 top-0 h-screen bg-[#0f172a] border-r border-gray-800 flex flex-col transition-all duration-300 z-50 ${sidebarWidthClass}`}>

                {/* --- HEADER AREA (Yenilənmiş Dizayn) --- */}
                <div className={`
                    border-b border-gray-800 transition-all duration-300
                    ${isCollapsed && !isMobile
                    ? 'p-4 flex flex-col items-center justify-center gap-6 py-6' // Bağlı olanda: Alt-alta, mərkəzdə, aralarında məsafə
                    : 'p-4 flex flex-row items-center justify-between h-[88px]' // Açıq olanda: Yan-yana
                }
                `}>

                    {/* LOGO hissəsi */}
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* İkon */}
                        <div className="min-w-[40px] w-10 h-10 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
                            <Rocket className="text-white" size={20} />
                        </div>

                        {/* Yazı (Bağlananda tamamilə gizlənir ki, yer tutmasın) */}
                        <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap 
                            ${isCollapsed && !isMobile ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                            <h1 className="text-lg font-bold text-white tracking-wide leading-tight">Mock</h1>
                            <p className="text-[10px] text-gray-400 font-mono">v1.0.0</p>
                        </div>
                    </div>

                    {/* TOGGLE BUTTON */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`
                                flex items-center justify-center rounded-lg transition-colors duration-200
                                ${isCollapsed
                                ? 'w-8 h-8 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' // Bağlı olanda biraz böyük və fonlu
                                : 'p-1.5 text-gray-500 hover:text-white hover:bg-gray-800' // Açıq olanda sadə
                            }
                            `}
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                {/* --- NAVIGATION LINKS --- */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group whitespace-nowrap
                                    ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 font-medium'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }
                                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.name : ''}
                            >
                                <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>

                                {/* Yazı: Bağlı olanda gizlənir */}
                                {(!isCollapsed || isMobile) && (
                                    <span className="transition-opacity duration-200">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* --- FOOTER AREA --- */}
                <div className="p-4 border-t border-gray-800">
                    <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                            US
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <div className="overflow-hidden whitespace-nowrap">
                                <p className="text-sm font-medium text-white truncate">Admin</p>
                                <p className="text-xs text-gray-500 truncate">admin@mock.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;