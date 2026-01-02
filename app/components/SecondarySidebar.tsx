'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Folder, Rocket, ChevronDown, Plus, Search,
    Terminal, Share2, Box, Zap
} from 'lucide-react';

const methodColors: any = {
    GET: 'text-emerald-500',
    POST: 'text-blue-500',
    PUT: 'text-amber-500',
    DELETE: 'text-red-500',
};

const initialData = [
    { id: '1', name: 'onboarding', type: 'FOLDER', parentId: null },
    { id: '2', name: 'ms-mock_to_adp-atlas', type: 'MOCK_GROUP', parentId: '1' },
    { id: '2-1', name: 'create_user_trigger', type: 'API', method: 'POST', parentId: '2' },
    { id: '2-2', name: 'order_event_stream', type: 'KAFKA', parentId: '2' },
    { id: '3', name: 'production_hotfix', type: 'FOLDER', parentId: null },
];

// --- AKSİYA MENYUSU ---
const ActionMenu = ({ onClose, onSelect }: { onClose: () => void; onSelect: (type: string) => void }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, [onClose]);

    const items = [
        { label: 'Package', icon: <Box size={16} />, type: 'FOLDER' },
        { label: 'Mock Group', icon: <Rocket size={16} />, type: 'MOCK_GROUP' },
        { label: 'Mock Flow', icon: <Zap size={16} />, type: 'API' },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 w-44 bg-[#1a1c2e] border border-white/10 rounded-lg shadow-2xl z-[999] py-1 animate-in fade-in zoom-in-95 duration-100"
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-zinc-300 hover:bg-indigo-600/40 hover:text-white transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.type);
                        onClose();
                    }}
                >
                    <span className="text-indigo-400">{item.icon}</span>
                    {item.label}
                </button>
            ))}
        </div>
    );
};

// --- TREE ITEM KOMPONENTİ ---
const TreeItem = ({ node, level, onAddChild }: any) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    const getIcon = () => {
        switch (node.type) {
            case 'FOLDER': return <Folder size={16} className="text-amber-500/80" fill="currentColor" fillOpacity={0.1} />;
            case 'MOCK_GROUP': return <Rocket size={16} className="text-indigo-400" />;
            case 'API': return <Terminal size={16} className="text-cyan-400/80" />;
            case 'KAFKA': return <Share2 size={16} className="text-purple-400/80" />;
            default: return null;
        }
    };

    return (
        <div className="select-none mb-0.5 relative">
            <div
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer group transition-all 
                    ${showMenu ? 'bg-white/10' : 'hover:bg-white/[0.05]'}
                `}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
                <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={() => setIsOpen(!isOpen)}>
                    <div className="w-4 flex items-center justify-center shrink-0">
                        {node.children?.length > 0 && (
                            <ChevronDown size={14} className={`text-zinc-600 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                        )}
                    </div>
                    <div className="shrink-0">{getIcon()}</div>
                    <span className="text-[13px] font-medium text-zinc-400 truncate group-hover:text-zinc-100 transition-colors font-sans">
                        {node.name}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 h-6">
                    {node.method && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded bg-black/30 ${methodColors[node.method]}`}>
                            {node.method}
                        </span>
                    )}

                    {(node.type === 'FOLDER' || node.type === 'MOCK_GROUP') && (
                        <div className="relative flex items-center h-full">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className={`p-1 rounded-md transition-all 
                                    ${showMenu ? 'bg-indigo-600 text-white opacity-100' : 'opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-indigo-400 hover:bg-white/10'}
                                `}
                            >
                                <Plus size={14} />
                            </button>
                            {showMenu && (
                                <ActionMenu
                                    onClose={() => setShowMenu(false)}
                                    onSelect={(type) => onAddChild(node.id, type)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isOpen && node.children && (
                <div className="mt-0.5">
                    {node.children.map((child: any) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- ƏSAS SİDEBAR ---
export default function SecondarySidebar() {
    const [nodes, setNodes] = useState(initialData);

    // Yeni element əlavə edən funksiya
    const handleAddNode = (parentId: string | null, type: string) => {
        const name = prompt(`Enter ${type.toLowerCase()} name:`) || `New ${type.toLowerCase()}`;

        const newNode = {
            id: Math.random().toString(36).substr(2, 9), // Sadə unikal ID
            name: name,
            type: type,
            parentId: parentId,
            ...(type === 'API' ? { method: 'GET' } : {}) // API-dirsə susmaya görə GET metodu verək
        };

        setNodes([...nodes, newNode]);
    };

    const treeData = useMemo(() => {
        const map: any = {};
        const tree: any[] = [];
        nodes.forEach((node) => { map[node.id] = { ...node, children: [] }; });
        Object.values(map).forEach((node: any) => {
            if (node.parentId) {
                if (map[node.parentId]) map[node.parentId].children.push(node);
            } else {
                tree.push(node);
            }
        });
        return tree;
    }, [nodes]);

    return (
        <div className="h-full flex flex-col bg-[#0d0e16]/30 overflow-visible">
            <div className="p-5 space-y-5 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">Collections</h2>
                    {/* Root səviyyəsinə (ən başa) əlavə etmək üçün düymə */}
                    <button
                        onClick={() => handleAddNode(null, 'FOLDER')}
                        className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-all"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Filter collections..."
                        className="w-full bg-[#121420] border border-indigo-500/10 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar overflow-x-visible">
                {treeData.map(node => (
                    <TreeItem
                        key={node.id}
                        node={node}
                        level={0}
                        onAddChild={handleAddNode}
                    />
                ))}
            </div>
        </div>
    );
}