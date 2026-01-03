// app/collections/page.tsx
'use client';
import React, { useState } from 'react';
import SecondarySidebar from './components/SecondarySidebar';
import WorkflowBuilder from './components/WorkflowBuilder'; // Sizin builder komponenti
import { Rocket, ArrowLeft } from "lucide-react";


export default function CollectionsPage() {
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0b12]">
            {/* --- SIDEBAR --- */}
            <aside
                className="relative border-r border-white/5 bg-[#0d0e16]/40 shrink-0 backdrop-blur-md"
                style={{ width: `${sidebarWidth}px` }}
            >
                <SecondarySidebar onSelectNode={(node) => setSelectedNode(node)} />

                {/* Resize Handle */}
                <div
                    onMouseDown={(e) => {/* resize logic */}}
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500/40"
                />
            </aside>

            {/* --- MAIN CONTENT (Bura CreateMockPage-in yerini tutur) --- */}
            <section className="flex-1 overflow-y-auto relative bg-[#0a0b12]">
                {selectedNode && (selectedNode.type === 'API' || selectedNode.type === 'KAFKA') ? (
                    <div className="h-full flex flex-col">
                        {/* Header hissəsi - Modern Dark Style */}
                        <div className="p-6 border-b border-white/5 bg-[#0d0e16]/20 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-indigo-400">✨ Edit Flow:</span> {selectedNode.name}
                                </h1>
                                <p className="text-xs text-zinc-500 mt-1 font-mono">
                                    Parent Group ID: {selectedNode.parentId}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        </div>

                        {/* Workflow Builder-i bura daxil edirik */}
                        <div className="flex-1 p-4 md:p-8 custom-scrollbar">
                            <div className="max-w-6xl mx-auto">
                                {/*<Test/>*/}
                                <WorkflowBuilder
                                    groupId={selectedNode.parentId}
                                    mockId={selectedNode.id}
                                    isLoading={false}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Default Boş Ekran */
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
                            <p className="text-zinc-500 text-lg">
                                Sol tərəfdən bir <span className="text-indigo-400 font-medium italic">Mock Flow</span> seçərək ssenarini redaktə etməyə başlayın.
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}