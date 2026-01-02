'use client';
import React from 'react';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const primaryWidth = 76;

    return (
        <div className="flex min-h-screen bg-[#0a0b12] text-white">
            {/* Həmişə görünən əsas ensiz sidebar */}
            <Sidebar />

            {/* Əsas məzmun sahəsi */}
            <main
                className="flex-1 min-h-screen"
                style={{ marginLeft: `${primaryWidth}px` }}
            >
                {children}
            </main>
        </div>
    );
}