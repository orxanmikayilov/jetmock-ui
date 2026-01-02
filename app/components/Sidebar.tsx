'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Rocket, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, isMobile }) => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Mock Groups', href: '/', icon: <Rocket size={20} /> },
        { name: 'Settings', href: '/settings', icon: <Settings size={20} /> }
    ];

    const sidebarWidthClass = isMobile
        ? (isCollapsed ? '-translate-x-full' : 'translate-x-0 w-64')
        : (isCollapsed ? 'w-20' : 'w-64');

    return (
        <>
            {/* MOBILE OVERLAY */}
            {isMobile && !isCollapsed && (
                <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={toggleSidebar} />
            )}

            <aside className={`fixed left-0 top-0 h-screen bg-[#0d0e16] border-r border-indigo-500/10 flex flex-col transition-all duration-300 z-50 shadow-2xl ${sidebarWidthClass}`}>

                {/* --- HEADER AREA --- */}
                <div className={`
                    border-b border-indigo-500/10 transition-all duration-300
                    ${isCollapsed && !isMobile
                    ? 'p-4 flex flex-col items-center justify-center gap-6 py-6'
                    : 'p-4 flex flex-row items-center justify-between h-[88px]'
                }
                `}>

                    {/* LOGO hissəsi */}
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[40px] w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center">
                            <Rocket className="text-white" size={20} />
                        </div>

                        <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap 
                            ${isCollapsed && !isMobile ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                            <h1 className="text-lg font-black text-white tracking-tight leading-tight">Fastmock</h1>
                        </div>
                    </div>

                    {/* TOGGLE BUTTON */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`
                                flex items-center justify-center rounded-xl transition-all duration-200
                                ${isCollapsed
                                ? 'w-8 h-8 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                                : 'p-1.5 text-zinc-600 hover:text-white hover:bg-white/5'
                            }
                            `}
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                {/* --- NAVIGATION LINKS --- */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap
                                    ${isActive
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
                                }
                                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.name : ''}
                            >
                                <span className={`${isActive ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                                    {item.icon}
                                </span>

                                {(!isCollapsed || isMobile) && (
                                    <span className="text-sm tracking-tight transition-opacity duration-200">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* --- FOOTER AREA (Admin Profile) --- */}
                <div className="p-4 border-t border-indigo-500/10">
                    <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 min-w-[32px] rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-400">
                            AD
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <div className="overflow-hidden whitespace-nowrap">
                                <p className="text-xs font-bold text-white truncate">Admin</p>
                                <p className="text-[10px] text-zinc-600 truncate font-medium">admin@mock.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;