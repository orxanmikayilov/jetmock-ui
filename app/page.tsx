'use client';
import React, { useState, useEffect, useCallback } from 'react';
import SecondarySidebar from './components/SecondarySidebar';
import { Rocket } from "lucide-react";

export default function CollectionsPage() {
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing) {
                // Minimum 200px, maksimum 600px olmaq şərtilə eni hesablayırıq
                // 76px ana sidebarın enidir, onu çıxırıq
                const newWidth = mouseMoveEvent.clientX - 76;
                if (newWidth > 200 && newWidth < 600) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div className={`flex h-screen overflow-hidden bg-[#0a0b12] ${isResizing ? 'underline-none select-none' : ''}`}>

            {/* --- SECONDARY SIDEBAR --- */}
            <aside
                className="relative border-r border-indigo-500/10 bg-[#0d0e16]/40 shrink-0 backdrop-blur-md"
                style={{ width: `${sidebarWidth}px` }}
            >
                <SecondarySidebar />

                {/* RESIZE HANDLE (Sürümə çubuğu) */}
                <div
                    onMouseDown={startResizing}
                    className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/40 transition-colors z-50
                        ${isResizing ? 'bg-indigo-500 w-[2px]' : ''}`}
                />
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <section className="flex-1 overflow-y-auto relative">
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                        <div className="relative w-24 h-24 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl">
                            <Rocket className="text-indigo-500" size={48} />
                        </div>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
                            Workspace-ə xoş gəlmisiniz
                        </h1>
                        <p className="text-zinc-500 text-lg leading-relaxed">
                            Sol tərəfdəki kolleksiyalardan birini seçin və ya
                            yeni bir <span className="text-indigo-400 font-medium">Mock senarisi</span> yaratmağa başlayın.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}