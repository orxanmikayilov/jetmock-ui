'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Rocket, LayoutGrid, Bell } from 'lucide-react';

interface SidebarProps {
    // isCollapsed: boolean; // Bu, ClientLayout-da default "true" olmalıdır
    // toggleSidebar: () => void;
    // isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Collections', href: '/', icon: <LayoutGrid size={22} /> },
        // { name: 'Environments', href: '/environments', icon: <Rocket size={22} /> },
        // { name: 'History', href: '/history', icon: <Bell size={22} /> },
        { name: 'Settings', href: '/settings', icon: <Settings size={22} /> }
    ];

    const sidebarWidth = "w-[76px]";

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-[#0d0e16] border-r border-indigo-500/10 flex flex-col z-50 transition-all ${sidebarWidth}`}>

            {/* LOGO AREA */}
            <div className="h-16 flex items-center justify-center border-b border-indigo-500/10 mb-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <Rocket className="text-white" size={20} />
                </div>
            </div>

            {/* NAVIGATION LINKS */}
            <nav className="flex-1 flex flex-col items-center py-2 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`w-full flex flex-col items-center justify-center py-3 gap-1 transition-all group relative
                                ${isActive
                                ? 'text-white border-l-2 border-indigo-500 bg-indigo-500/5'
                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                            }
                            `}
                        >
                            {/* Icon hissəsi */}
                            <span className={`${isActive ? 'text-indigo-400' : 'group-hover:text-zinc-200 transition-colors'}`}>
                                {item.icon}
                            </span>

                            {/* Yazı hissəsi - İkonun altında kiçik */}
                            <span className={`text-[10px] font-medium tracking-tight text-center leading-none
                                ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-200'}
                            `}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* USER PROFILE AREA */}
            <div className="p-2 border-t border-indigo-500/10 mb-4">
                <div className="flex flex-col items-center gap-1 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition-all">
                    <div className="w-8 h-8 rounded-md bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                        AD
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Admin</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;