'use client';
import React, { useState, useMemo } from 'react';
import {
    Folder, Rocket, ChevronDown, Plus,
    Settings, Trash2, Search, Terminal,
    Link as LinkIcon, Share2
} from 'lucide-react';

const methodColors: any = {
    GET: 'text-emerald-500',
    POST: 'text-blue-500',
    PUT: 'text-amber-500',
    DELETE: 'text-red-500',
};

type NodeType = 'FOLDER' | 'MOCK_GROUP' | 'API' | 'KAFKA';

interface TreeNode {
    id: string;
    name: string;
    type: NodeType;
    parentId: string | null;
    method?: string;
    path?: string;
    broker?: string;
    topic?: string;
    children?: TreeNode[];
}

const initialData: TreeNode[] = [
    { id: '1', name: 'onboarding', type: 'FOLDER', parentId: null },
    { id: '2', name: 'ms-mock_to_adp-atlas', type: 'MOCK_GROUP', parentId: '1', path: '/ms-mock_to_adp-atlas' },
    { id: '2-1', name: 'create_user_trigger', type: 'API', method: 'POST', parentId: '2', path: '/api/v1/users' },
    { id: '2-2', name: 'order_event_stream', type: 'KAFKA', parentId: '2', broker: 'prod-kafka-01', topic: 'orders-topic' },
    { id: '3', name: 'production_hotfix', type: 'FOLDER', parentId: null },
];

const MainWorkspace = () => {
    const [nodes] = useState<TreeNode[]>(initialData);

    const treeData = useMemo(() => {
        const map: any = {};
        const tree: TreeNode[] = [];
        nodes.forEach((node) => { map[node.id] = { ...node, children: [] }; });
        Object.values(map).forEach((node: any) => {
            if (node.parentId) map[node.parentId].children.push(node);
            else tree.push(node);
        });
        return tree;
    }, [nodes]);

    return (
        <div className="flex-1 bg-[#0a0b12] min-h-screen text-zinc-400 font-sans selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto pt-12 px-10">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Mock Architect <span className="text-zinc-700 font-medium text-lg ml-2">v3.6</span>
                        </h1>
                        <p className="mt-2 text-zinc-500 text-sm italic">Unified architecture for triggers and routes.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            <input
                                type="text"
                                placeholder="Search workspace..."
                                className="bg-[#121420] border border-indigo-500/10 rounded-2xl py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 w-80 text-white transition-all placeholder:text-zinc-700"
                            />
                        </div>
                        <button className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-white/5">
                            <Plus size={18} /> New Root
                        </button>
                    </div>
                </header>

                {/* Tree View Table */}
                <div className="bg-[#0d0e16]/80 border border-indigo-500/10 rounded-[1rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="grid grid-cols-12 gap-4 px-10 py-5 bg-[#121420]/50 border-b border-indigo-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                        <div className="col-span-10">System Structure & Trigger Points</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-indigo-500/5">
                        {treeData.map(node => (
                            <TreeItemComponent key={node.id} node={node} level={0} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TreeItemComponent = ({ node, level }: any) => {
    const [isOpen, setIsOpen] = useState(true);

    const getIcon = () => {
        switch(node.type) {
            case 'FOLDER': return <Folder size={18} className="text-amber-500" />;
            case 'MOCK_GROUP': return <Rocket size={18} className="text-indigo-500" />;
            case 'API': return <Terminal size={18} className="text-cyan-400" />;
            case 'KAFKA': return <Share2 size={18} className="text-purple-400" />;
            default: return null;
        }
    };

    const renderSubInfo = () => {
        if (node.type === 'FOLDER') return null;
        if (node.type === 'MOCK_GROUP') {
            return <div className="flex items-center gap-1.5 text-zinc-600 font-mono"><LinkIcon size={10} /> <span>{node.path}</span></div>;
        }
        if (node.type === 'API') {
            return (
                <div className="flex items-center gap-1.5 font-mono">
                    <span className={`font-black ${methodColors[node.method!]}`}>{node.method}</span>
                    <span className="text-zinc-600">{node.path}</span>
                </div>
            );
        }
        if (node.type === 'KAFKA') {
            return <div className="text-purple-400/60 font-mono">{node.broker}:{node.topic}</div>;
        }
        return null;
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 px-10 py-4 hover:bg-indigo-500/5 transition-all items-center group">
                <div className="col-span-10 flex items-center gap-4" style={{ paddingLeft: `${level * 28}px` }}>
                    <div className="w-5 flex justify-center">
                        {node.children && node.children.length > 0 && (
                            <button onClick={() => setIsOpen(!isOpen)} className={`transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'} text-zinc-700 hover:text-white`}>
                                <ChevronDown size={18} />
                            </button>
                        )}
                    </div>

                    <div className="p-2 bg-indigo-950/20 rounded-xl border border-indigo-500/10 transition-colors group-hover:border-indigo-500/30">
                        {getIcon()}
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className={`text-[14px] font-semibold transition-colors ${node.type === 'API' || node.type === 'KAFKA' ? 'text-zinc-400' : 'text-zinc-100 group-hover:text-white'}`}>
                            {node.name}
                        </span>
                        <div className="text-[11px] mt-0.5">
                            {renderSubInfo()}
                        </div>
                    </div>
                </div>

                <div className="col-span-2 flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {node.type !== 'API' && node.type !== 'KAFKA' && (
                        <button className="p-2 hover:bg-indigo-500/10 rounded-lg text-zinc-600 hover:text-indigo-400"><Plus size={18} /></button>
                    )}
                    <button className="p-2 hover:bg-indigo-500/10 rounded-lg text-zinc-600 hover:text-white"><Settings size={18} /></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
            </div>

            {isOpen && node.children && node.children.map((child: any) => (
                <TreeItemComponent key={child.id} node={child} level={level + 1} />
            ))}
        </>
    );
};

export default MainWorkspace;