// app/collections/page.tsx
'use client';
import React, { useState, useCallback, useEffect } from 'react';
import SecondarySidebar from './components/SecondarySidebar';
import WorkflowBuilder from './components/WorkflowBuilder';
import { Rocket, ArrowLeft, Settings2, LayoutGrid, ChevronRight } from "lucide-react";

export default function CollectionsPage() {
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // --- RESIZE LOGIC START ---
    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (e: MouseEvent) => {
            if (isResizing) {
                // Sidebar üçün minimum 200px, maksimum 600px limit qoyuruq
                const newWidth = e.clientX;
                if (newWidth > 200 && newWidth < 600) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);
    // --- RESIZE LOGIC END ---

    return (
        <div className="flex h-screen overflow-hidden bg-[#050508] text-zinc-400 select-none">

            {/* --- SIDEBAR --- */}
            <aside
                className="relative shrink-0 bg-[#08090f] z-20 flex flex-col border-r border-white/[0.03]"
                style={{ width: `${sidebarWidth}px` }}
            >
                {/* Boşluq (Project Hub silinib, amma padding saxlanılıb) */}
                {/*<div className="h-4 shrink-0" />*/}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <SecondarySidebar onSelectNode={(node) => setSelectedNode(node)} />
                </div>

                {/* Resize Handle: Artıq onMouseDown əlavə edilib */}
                <div
                    onMouseDown={startResizing}
                    className={`absolute top-0 right-0 w-[4px] h-full cursor-col-resize transition-colors z-50
                        ${isResizing ? 'bg-indigo-500' : 'hover:bg-indigo-500/40'}`}
                />
            </aside>

            {/* --- MAIN CONTENT (V1 Header + V2 Canvas Background) --- */}
            <section className={`flex-1 relative overflow-y-auto custom-scrollbar bg-[#0a0b12] ${isResizing ? 'pointer-events-none' : ''}`}>

                {/* Background Decor (V2) */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"
                     style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none z-0" />

                <div className="relative z-10 h-full flex flex-col">
                    {selectedNode ? (
                        <div className="max-w-[1200px] w-full mx-auto px-6 py-8">

                            {/* Floating Navigation (V1 Style) */}
                            <nav className="flex items-center justify-between mb-10 bg-[#0d0e16]/60 border border-white/[0.05] p-4 rounded-3xl backdrop-blur-xl shadow-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                        <Rocket size={20} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-widest">
                                                {selectedNode.type || 'FLOW'}
                                            </span>
                                            <ChevronRight size={12} className="text-zinc-700" />
                                            <h2 className="text-sm font-bold text-white tracking-tight">
                                                {selectedNode.name}
                                            </h2>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block opacity-60">
                                            ID: {selectedNode.id}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setSelectedNode(null)}
                                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                                    >
                                        <ArrowLeft size={18} className="text-zinc-400" />
                                    </button>
                                </div>
                            </nav>

                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <WorkflowBuilder
                                    groupId={selectedNode.parentId}
                                    mockId={selectedNode.id}
                                    isLoading={false}
                                />
                            </div>
                        </div>
                    ) : (
                        <EmptyStateView />
                    )}
                </div>
            </section>
        </div>
    );
}

const EmptyStateView = () => (
    <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative text-center space-y-6 animate-in fade-in zoom-in duration-1000">
            <div className="w-24 h-24 mx-auto relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative w-full h-full bg-[#0d0e16] border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110">
                    <Settings2 className="text-indigo-500 animate-[spin_12s_linear_infinite]" size={40} />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tighter">Workspace Ready</h2>
                <p className="text-zinc-500 text-sm max-w-[320px] mx-auto leading-relaxed">
                    Select a <span className="text-indigo-400 font-medium italic">Mock Flow</span> from the sidebar to begin building your logic.
                </p>
            </div>

        </div>
    </div>
);