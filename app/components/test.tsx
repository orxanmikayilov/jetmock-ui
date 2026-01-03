    // Test10.tsx - Guided Ghost Nodes
    import React, { useState } from 'react';
    import { Plus, Zap, Activity, Filter } from 'lucide-react';

    export default function Test() {
        const [workflow, setWorkflow] = useState<string[]>([]);

        // Placeholder-lər üçün data
        const placeholders = [
            { id: 'cond', title: 'Add Condition', icon: <Filter size={20}/>, color: 'hover:border-amber-500/50 hover:bg-amber-500/5' },
            { id: 'trig', title: 'Add Starting Trigger', icon: <Zap size={20}/>, color: 'hover:border-indigo-500/50 hover:bg-indigo-500/5' },
            { id: 'act', title: 'Add Action Component', icon: <Activity size={20}/>, color: 'hover:border-rose-500/50 hover:bg-rose-500/5' },
        ];

        return (
            <div className="h-full w-full bg-[#0a0b12] p-10 flex flex-col items-center overflow-y-auto">
                <div className="w-full max-w-2xl space-y-6">

                    {/* Real Workflow Elements */}
                    {workflow.map((item, i) => (
                        <div key={i} className="p-6 bg-[#121420] border border-white/5 rounded-3xl shadow-xl flex items-center justify-between group animate-in slide-in-from-bottom-2">
                            <span className="text-zinc-300 font-medium">{item}</span>
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        </div>
                    ))}

                    {/* GUIDED EMPTY STATE (Ghost Nodes) */}
                    {workflow.length === 0 && (
                        <div className="space-y-4">
                            <p className="text-center text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mb-8">Design your workflow</p>

                            {placeholders.map((p, idx) => (
                                <div key={p.id} className="relative">
                                    <button
                                        onClick={() => setWorkflow([...workflow, p.title.replace('Add ', '')])}
                                        className={`w-full h-24 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 group ${p.color}`}
                                    >
                                        <div className="text-zinc-600 group-hover:text-white transition-colors">
                                            {p.icon}
                                        </div>
                                        <span className="text-zinc-600 group-hover:text-zinc-300 text-[11px] font-black uppercase tracking-widest transition-colors">
                        {p.title}
                      </span>

                                        {/* Plus icon on hover */}
                                        <div className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="text-white" size={20} />
                                        </div>
                                    </button>

                                    {/* Connector line between ghost nodes */}
                                    {idx < placeholders.length - 1 && (
                                        <div className="h-4 w-px bg-white/5 mx-auto" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }