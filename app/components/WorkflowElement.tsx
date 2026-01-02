'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import InlineConfigForm from './InlineConfigForm';

interface WorkflowItem {
    id: string;
    type: 'trigger' | 'response' | 'action' | 'logic';
    name: string;
    config: any;
    isOpen?: boolean;
    isPaired?: boolean;
    icon?: string;
}

interface Props {
    item: WorkflowItem;
    index: number;
    onRemove: (id: string) => void;
    onToggleConfig: (id: string) => void;
    onConfigChange: (id: string, newConfig: any) => void;
}

const WorkflowElement: React.FC<Props> = ({ item, index, onRemove, onToggleConfig, onConfigChange }) => {

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const isMovable = item.type !== 'trigger' && !item.isPaired && item.type !== 'logic';
    const showDeleteButton = !item.isPaired;

    let colorClass = 'bg-gray-700 border-gray-600';
    if (item.type === 'trigger') colorClass = 'bg-blue-700 border-blue-500';
    if (item.type === 'response') colorClass = 'bg-green-700 border-green-500';
    if (item.type === 'action') colorClass = 'bg-purple-700 border-purple-500';
    if (item.type === 'logic') colorClass = 'bg-yellow-700 border-yellow-500';

    const displayIndex = index + 1;
    const elementSymbol = item.isPaired ? '🔗' : '⚙️';

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(item.id);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleConfig(item.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`p-4 rounded-lg shadow-xl transition-all border-l-4 ${colorClass} mb-3 cursor-default`}
        >
            <div className="flex justify-between items-center">

                <div className="flex items-center space-x-3">

                    <div className="flex items-center gap-2">
                        <span
                            className={`text-lg font-semibold text-gray-300 p-2 -ml-2 rounded transition-colors ${isMovable ? 'cursor-grab hover:bg-gray-600' : ''}`}
                            {...(isMovable ? listeners : {})}
                        >
                            {displayIndex}.
                        </span>
                    </div>

                    <span className="font-semibold text-lg text-white">{item.name} {elementSymbol}</span>
                    {item.isPaired && <span className="text-xs text-yellow-300">(Mandatory Response)</span>}
                </div>

                <div className="space-x-2 flex items-center">
                    <button
                        type="button"
                        onClick={handleToggle}
                        className="p-2 rounded-full text-white transition-colors bg-gray-700 hover:bg-gray-600"
                        title={item.isOpen ? 'Close' : 'Configure'}
                    >
                        {item.isOpen ? '❌' : '⚙️'}
                    </button>
                    {showDeleteButton && (
                        <button
                            type='button'
                            onClick={handleRemove}
                            className="p-2 rounded-full text-white transition-colors bg-red-700 hover:bg-red-600"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            {item.isOpen && (
                <InlineConfigForm item={item} onConfigChange={(newConfig) => onConfigChange(item.id, newConfig)} />
            )}
        </div>
    );
};

export default WorkflowElement;
