'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Folder,
    Rocket,
    ChevronDown,
    Plus,
    Search,
    Terminal,
    Share2,
    Box,
    Zap,
    Trash2,
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

// ---- types
type NodeType = 'FOLDER' | 'MOCK_GROUP' | 'API' | 'KAFKA';
type NodeItem = {
    id: string;
    name: string;
    type: NodeType;
    parentId: string | null;
    method?: keyof typeof methodColors;
};

// ---- rules:
// 1) FOLDER (package) -> can create: FOLDER, MOCK_GROUP, API (mockflow)
// 2) MOCK_GROUP -> can create: FOLDER, API (NO MOCK_GROUP)
// 3) Inside MOCK_GROUP, packages cannot contain MOCK_GROUP (no nested groups under a group)
// 4) API (mockflow) -> cannot create anything
//
// NOTE: KAFKA is an item type, but we don't create it from menu in this UI.

const isDescendantOfType = (nodes: NodeItem[], nodeId: string, ancestorType: NodeType) => {
    let current = nodes.find((n) => n.id === nodeId);
    while (current?.parentId) {
        const parent = nodes.find((n) => n.id === current!.parentId);
        if (!parent) break;
        if (parent.type === ancestorType) return true;
        current = parent;
    }
    return false;
};

const allowedChildTypesForParent = (nodes: NodeItem[], parentId: string): NodeType[] => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return [];

    // Rule 4
    if (parent.type === 'API') return [];

    // Rule 1
    if (parent.type === 'FOLDER') {
        // If this folder is inside a MOCK_GROUP => Rule 3 (cannot create MOCK_GROUP here)
        const insideMockGroup = isDescendantOfType(nodes, parentId, 'MOCK_GROUP');
        return insideMockGroup ? (['FOLDER', 'API'] as NodeType[]) : (['FOLDER', 'MOCK_GROUP', 'API'] as NodeType[]);
    }

    // Rule 2
    if (parent.type === 'MOCK_GROUP') {
        return ['FOLDER', 'API'];
    }

    // KAFKA, etc.
    return [];
};

const ActionMenu = ({
                        onClose,
                        onSelect,
                        allowedTypes,
                    }: {
    onClose: () => void;
    onSelect: (type: NodeType) => void;
    allowedTypes: NodeType[];
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, [onClose]);

    const items = [
        { label: 'Package', icon: <Box size={16} />, type: 'FOLDER' as NodeType },
        { label: 'Mock Group', icon: <Rocket size={16} />, type: 'MOCK_GROUP' as NodeType },
        { label: 'Mock Flow', icon: <Zap size={16} />, type: 'API' as NodeType },
    ].filter((i) => allowedTypes.includes(i.type));

    if (items.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-full mt-2 w-44 bg-[#1a1c2e] border border-white/10 rounded-lg shadow-2xl z-[9999] py-1 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-zinc-300 hover:bg-indigo-600 hover:text-white transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(item.type);
                        onClose();
                    }}
                >
                    <span className="text-indigo-400 shrink-0">{item.icon}</span>
                    {item.label}
                </button>
            ))}
        </div>
    );
};

const TreeItem = ({ node, level, onAddChild, onDelete, nodes }: any) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    const getIcon = () => {
        switch (node.type) {
            case 'FOLDER':
                return (
                    <Folder
                        size={16}
                        className="text-amber-500/80"
                        fill="currentColor"
                        fillOpacity={0.1}
                    />
                );
            case 'MOCK_GROUP':
                return <Rocket size={16} className="text-indigo-400" />;
            case 'API':
                return <Terminal size={16} className="text-cyan-400/80" />;
            case 'KAFKA':
                return <Share2 size={16} className="text-purple-400/80" />;
            default:
                return null;
        }
    };

    const allowedTypes = allowedChildTypesForParent(nodes, node.id);
    const canAdd = allowedTypes.length > 0;

    return (
        <div className="select-none mb-0.5 relative">
            <div
                className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all group
          ${showMenu ? 'bg-white/10' : 'hover:bg-[#0d0e16]'}
        `}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
            >
                {/* SOL: text */}
                <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setIsOpen(!isOpen)}>
                    <div className="w-4 flex items-center justify-center shrink-0">
                        {node.children?.length > 0 && (
                            <ChevronDown
                                size={14}
                                className={`text-zinc-600 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                            />
                        )}
                    </div>

                    <div className="shrink-0">{getIcon()}</div>

                    <span className="flex-1 min-w-0 text-[13px] font-medium text-zinc-400 truncate group-hover:text-zinc-100 transition-all duration-200">
            {node.name}
          </span>
                </div>

                {/* SAĞ: actions (hover-da açılır, showMenu olanda overflow visible) */}
                <div
                    className={`
            flex items-center gap-1 shrink-0
            ${showMenu ? 'overflow-visible' : 'overflow-hidden'}
            transition-[max-width,opacity] duration-200 ease-in-out
            ${
                        showMenu
                            ? 'max-w-[260px] opacity-100 pointer-events-auto'
                            : 'max-w-0 opacity-0 pointer-events-none group-hover:max-w-[260px] group-hover:opacity-100 group-hover:pointer-events-auto'
                    }
          `}
                >
                    {node.method && (
                        <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded bg-[#0d0e16] border border-white/5 shrink-0 ${methodColors[node.method]}`}
                        >
              {node.method}
            </span>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(node.id);
                        }}
                        className="p-1 rounded-md bg-[#1a1c2e] text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all shadow-lg"
                    >
                        <Trash2 size={14} />
                    </button>

                    {(node.type === 'FOLDER' || node.type === 'MOCK_GROUP') && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!canAdd) return;
                                    setShowMenu((v: boolean) => !v);
                                }}
                                disabled={!canAdd}
                                title={!canAdd ? 'Bu element daxilində create etmək qadağandır' : 'Əlavə et'}
                                className={`p-1 rounded-md transition-all shadow-lg ${
                                    !canAdd
                                        ? 'bg-[#1a1c2e]/40 text-zinc-700 cursor-not-allowed'
                                        : showMenu
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-[#1a1c2e] text-zinc-500 hover:text-indigo-400 hover:bg-white/10'
                                }`}
                            >
                                <Plus size={14} />
                            </button>

                            {showMenu && (
                                <ActionMenu
                                    onClose={() => setShowMenu(false)}
                                    allowedTypes={allowedTypes}
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
                            onDelete={onDelete}
                            nodes={nodes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function SecondarySidebar() {
    const [nodes, setNodes] = useState<NodeItem[]>(initialData as NodeItem[]);

    const handleAddNode = (parentId: string | null, type: NodeType) => {
        // root add (header +) -> only allow FOLDER
        if (!parentId) {
            if (type !== 'FOLDER') return;
        } else {
            // enforce rules server-side in UI too
            const allowed = allowedChildTypesForParent(nodes, parentId);
            if (!allowed.includes(type)) {
                alert('Bu element daxilində bu tip yaratmaq qadağandır.');
                return;
            }
        }

        const name = prompt(`Enter ${type.toLowerCase()} name:`) || `New ${type.toLowerCase()}`;
        if (!name.trim()) return;

        const newNode: NodeItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            parentId,
            ...(type === 'API' ? { method: 'GET' } : {}),
        };

        setNodes((prev) => [...prev, newNode]);
    };

    const handleDeleteNode = (nodeId: string) => {
        if (!confirm('Are you sure?')) return;

        const getAllChildrenIds = (id: string, allNodes: NodeItem[]): string[] => {
            const children = allNodes.filter((n) => n.parentId === id);
            let ids = [id];
            children.forEach((child) => {
                ids = [...ids, ...getAllChildrenIds(child.id, allNodes)];
            });
            return ids;
        };

        const idsToDelete = getAllChildrenIds(nodeId, nodes);
        setNodes((prev) => prev.filter((node) => !idsToDelete.includes(node.id)));
    };

    const treeData = useMemo(() => {
        const map: any = {};
        const tree: any[] = [];
        nodes.forEach((node) => {
            map[node.id] = { ...node, children: [] };
        });
        Object.values(map).forEach((node: any) => {
            if (node.parentId && map[node.parentId]) {
                map[node.parentId].children.push(node);
            } else if (!node.parentId) {
                tree.push(node);
            }
        });
        return tree;
    }, [nodes]);

    return (
        <div className="h-full flex flex-col bg-[#0d0e16]/30">
            <div className="p-5 space-y-5 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                        Collections
                    </h2>
                    <button
                        onClick={() => handleAddNode(null, 'FOLDER')}
                        className="p-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-md transition-all"
                        title="Yeni Package"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="relative group">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Filter collections..."
                        className="w-full bg-[#121420] border border-indigo-500/10 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-6 custom-scrollbar">
                {treeData.map((node) => (
                    <TreeItem
                        key={node.id}
                        node={node}
                        level={0}
                        onAddChild={handleAddNode}
                        onDelete={handleDeleteNode}
                        nodes={nodes}
                    />
                ))}
            </div>
        </div>
    );
}
