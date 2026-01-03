// components/SmartWorkflowBuilder.tsx

'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {arrayMove} from '@dnd-kit/sortable';

import WorkflowElement from './WorkflowElement';
import toast from "react-hot-toast";
import {Plus} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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
    groupId: string;
    mockId: string;
    isLoading: boolean;
    initialWorkflow?: {
        name: string;
        items: WorkflowItem[];
    };
}

const ELEMENT_PALETTE: Omit<WorkflowItem, 'id' | 'isPaired' | 'isOpen'>[] = [
    {type: 'logic', name: 'Conditional Filter', icon: '🔍', config: {rules: []}},
    {type: 'trigger', name: 'API Request Trigger', icon: '🌐', config: {method: 'POST', endpoint: '/api/v1/'}},
    {type: 'trigger', name: 'Kafka Event Trigger', icon: '📥', config: {topic: ''}},
    {type: 'action', name: 'Callback API Call', icon: '📤', config: {url: '', method: 'POST'}},
    {
        type: 'action',
        name: 'Kafka Publish Event',
        icon: '📢',
        config: {topic: '', broker: '', payload: '{ "status": "sent" }'}
    },
    {type: 'action', name: 'Global Variables', icon: '📢', config: {variable: ''}},
];

const WorkflowBuilder: React.FC<Props> = ({initialWorkflow, groupId, mockId, isLoading}) => {

    const router = useRouter();
    const [workflow, setWorkflow] = useState<WorkflowItem[]>([]);
    const [mockName, setMockName] = useState(initialWorkflow?.name || '');
    const [dragError, setDragError] = useState<string | null>(null);
    const hasLogic = workflow.some(w => w.type === 'logic');

    useEffect(() => {
        if (initialWorkflow) {
            setMockName(initialWorkflow.name || '');
            setWorkflow(initialWorkflow.items || []);
        }
    }, [initialWorkflow]);

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    useEffect(() => {
        if (dragError) {
            const timer = setTimeout(() => setDragError(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [dragError]);

    const saveScenarioToBackend = async () => {
        const apiBody: any = {
            name: mockName.trim(),
            groupId: groupId,
            flowSteps: []
        };

        workflow.forEach((item, idx) => {
            const orderNumber = idx + 1;

            if (item.type === "trigger" && item.name.includes("API")) {
                apiBody.flowSteps.push({
                    elementName: "API_TRIGGER_REQUEST",
                    orderNumber,
                    method: item.config.method,
                    path: item.config.endpoint
                });
            }

            if (item.type === "response") {
                apiBody.flowSteps.push({
                    elementName: "API_TRIGGER_RESPONSE",
                    orderNumber,
                    status: Number(item.config.status),
                    latency: Number(item.config.latency || 0),

                    header: item.config.headers || '{"Content-Type": "application/json"}',

                    body: item.config.body
                });
            }

            if (item.type === "trigger" && item.name.includes("Kafka")) {

                apiBody.flowSteps.push({
                    elementName: "KAFKA_TRIGGER",
                    orderNumber,
                    topic: item.config.topic,
                    broker: item.config.broker
                });
            }

            if (item.type === "logic") {
                const spel = item.config.mode === "query"
                    ? item.config.spel
                    : require("./InlineConfigForm").generateSpelFromRules(item.config.rules);
                apiBody.flowSteps.push({
                    elementName: "CONDITION",
                    orderNumber,
                    expression: spel
                });

            }

            if (item.type === "action" && item.name.includes("Kafka Publish")) {
                apiBody.flowSteps.push({
                    elementName: "KAFKA_PUBLISHER",
                    orderNumber,
                    topic: item.config.topic,
                    broker: item.config.brokerId,
                    body: item.config.payload
                })
            }
            if (item.type === "action" && item.name.includes("Global Variables")) {
                apiBody.flowSteps.push({
                    elementName: "GLOBAL_VARIABLE",
                    orderNumber,
                    variable: item.config.variable
                })
            }


            if (item.type === "action" && item.name.includes("Callback")) {
                apiBody.flowSteps.push({
                    elementName: "CALLBACK_API",
                    orderNumber,
                    method: item.config.method,
                    path: item.config.url,
                    latency: Number(item.config.latency || 0),
                    header: item.config.headers || '{"Content-Type": "application/json"}',
                    param: item.config.param || "para",
                    body: item.config.payload
                });
            }
        });

        console.log("FINAL BODY:", apiBody);

        const method = initialWorkflow ? 'PUT' : 'POST';
        const url = initialWorkflow
            ? `${BASE_URL}/v1/mocks/${mockId}`
            : `${BASE_URL}/v1/mocks`;

        const res = await fetch(url, {
            method: method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(apiBody)
        });

        if (!res.ok) {

            const err = await res.json();

            if (err.code === "VALIDATION_EXCEPTION" && err.checks?.length) {
                const text = err.checks
                    .map(check => `• ${check.path}: ${check.message}`)
                    .join("\n");

                toast.error(text);
            } else {
                toast.error(err.message || "Unexpected error occurred");
            }
            return
        }

        toast.success("Scenario saved successfully!");
        router.push(`/groups/${groupId}`);
    };


    const handleToggleConfig = (id: string) => {
        setWorkflow(prev => prev.map(item =>
            item.id === id ? {...item, isOpen: !item.isOpen} : {...item, isOpen: false}
        ));
        setDragError(null);
    };

    const handleConfigChange = (id: string, newConfig: any) => {
        setWorkflow(prev => prev.map(item =>
            item.id === id ? {...item, config: newConfig} : item
        ));
    };

    const handleAddElement = (element: Omit<WorkflowItem, 'id' | 'isPaired' | 'isOpen'>) => {
        const newItem: WorkflowItem = {
            ...element,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            isOpen: false,
            isPaired: false,
        };

        // LOGIC → always at top
        if (element.type === "logic") {
            setWorkflow(prev => {
                // Əvvəlcə bütün logic-ləri silirik (bir logic allowed)
                const withoutLogic = prev.filter(i => i.type !== "logic");
                return [newItem, ...withoutLogic];
            });
            return;
        }

        // -----------------------------------------
        // 2) TRIGGER → həmişə logic-dən sonra gəlməlidir
        // -----------------------------------------
        if (element.type === "trigger") {

            // Trigger yalnız bir dəfə ola bilər
            if (workflow.some(w => w.type === "trigger")) {
                setDragError("Workflow can only have one Trigger.");
                return;
            }

            // Mandatory response part for API triggers
            let responseItem: WorkflowItem | null = null;
            if (element.name.includes("API")) {
                responseItem = {
                    id: Date.now().toString() + "_resp",
                    type: "response",
                    name: "HTTP Response",
                    icon: "✔️",
                    config: {status: 200, body: "{}", headers: "{}"},
                    isOpen: false,
                    isPaired: true,
                };
            }

            setWorkflow(prev => {
                const logic = prev.filter(i => i.type === "logic");
                const actions = prev.filter(i => i.type !== "logic" && i.type !== "trigger" && !i.isPaired);

                const newList = [];
                if (logic.length > 0) newList.push(logic[0]);
                newList.push(newItem);
                if (responseItem) newList.push(responseItem);
                return [...newList, ...actions];
            });

            return;
        }

        // ACTION
        setWorkflow(prev => [...prev, newItem]);
    };


    // ------------------- REMOVE ELEMENT -------------------
    const handleRemoveElement = (id: string) => {
        const itemToRemove = workflow.find(i => i.id === id);

        setWorkflow(prev => {
            let next = prev.filter(item => item.id !== id);

            if (itemToRemove?.type === 'trigger' && itemToRemove.name.includes('API')) {
                next = next.filter(item => !item.isPaired);
            }
            return next;
        });
    };


    // ------------------- DRAG END RULES -------------------
    const handleDragEnd = (event: any) => {
        const {active, over} = event;

        if (!over || active.id === over.id) return;

        const oldIndex = workflow.findIndex((i) => i.id === active.id);
        const newIndex = workflow.findIndex((i) => i.id === over.id);

        const movingItem = workflow[oldIndex];

        const logicIndex = workflow.findIndex(i => i.type === "logic");
        const triggerIndex = workflow.findIndex(i => i.type === "trigger");

        if (movingItem.type === "logic") {
            setDragError("Conditional Filter must remain first.");
            return;
        }

        if (newIndex <= logicIndex) {
            setDragError("Nothing can move before Conditional Filter.");
            return;
        }

        if (movingItem.type === "action" && triggerIndex !== -1 && newIndex <= triggerIndex) {
            setDragError("Actions cannot move before Trigger.");
            return;
        }

        if (movingItem.type === "trigger") {
            setDragError("Trigger cannot be moved.");
            return;
        }

        if (movingItem.isPaired) {
            setDragError("Mandatory Response cannot be moved.");
            return;
        }

        setWorkflow(items => arrayMove(items, oldIndex, newIndex));
    };
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddingAction, setIsAddingAction] = useState(false);
    const hasTrigger = workflow.some(w => w.type === 'trigger');
    const isApiTrigger = workflow.some(w => w.type === 'trigger' && w.name.includes('API'));
    const hasResponse = workflow.some(w => w.type === 'response');

    const isWorkflowValid =
        mockName.trim().length > 0 &&
        hasTrigger &&
        (!isApiTrigger || hasResponse);


    // ------------------- RENDER -------------------
    const LOGIC_ELEMENTS = ELEMENT_PALETTE.filter(e => e.type === 'logic');
    const TRIGGER_ELEMENTS = ELEMENT_PALETTE.filter(e => e.type === 'trigger');
    const ACTION_ELEMENTS = ELEMENT_PALETTE.filter(e => e.type === 'action');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            if (isWorkflowValid) saveScenarioToBackend();
        }} className="space-y-8 animate-in fade-in duration-500">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 min-h-[600px]">
                <div className="md:col-span-4 p-8 bg-[#0d0e16]/40 border-2 border-dashed border-white/5 rounded-3xl relative min-h-[500px] backdrop-blur-sm shadow-inner">
                    <div className="max-w-4xl mx-auto space-y-4">

                        {/* 1. CONDITION SECTION (Dəyişməyib) */}
                        {hasLogic ? (
                            workflow.filter(item => item.type === 'logic').map(item => (
                                <WorkflowElement
                                    key={item.id}
                                    item={item}
                                    index={workflow.findIndex(i => i.id === item.id)}
                                    onRemove={handleRemoveElement}
                                    onToggleConfig={handleToggleConfig}
                                    onConfigChange={handleConfigChange}
                                />
                            ))
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleAddElement(ELEMENT_PALETTE.find(e => e.type === 'logic')!)}
                                className="w-full h-[60px] border border-dashed border-white/10 rounded-[1.2rem] flex items-center justify-center gap-2 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                            >
                                <Plus size={14} className="text-zinc-600 group-hover:text-amber-400"/>
                                <span
                                    className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">Add Condition</span>
                            </button>
                        )}

                        {/* 2. TRIGGER SECTION (Dəyişməyib) */}
                        {hasTrigger ? (
                            workflow.filter(item => item.type === 'trigger' || item.type === 'response').map(item => (
                                <WorkflowElement
                                    key={item.id}
                                    item={item}
                                    index={workflow.findIndex(i => i.id === item.id)}
                                    onRemove={handleRemoveElement}
                                    onToggleConfig={handleToggleConfig}
                                    onConfigChange={handleConfigChange}
                                />
                            ))
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleAddElement(ELEMENT_PALETTE.find(e => e.type === 'trigger' && e.name.includes('API'))!)}
                                className="w-full h-[60px] border border-dashed border-white/10 rounded-[1.2rem] flex items-center justify-center gap-2 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                            >
                                <Plus size={14} className="text-zinc-600 group-hover:text-indigo-400"/>
                                <span
                                    className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">Add Starting Trigger</span>
                            </button>
                        )}

                        {/* 3. ACTIONS SECTION - VERSİYA 1 (GRID SELECTOR) */}
                        <div className="space-y-4 pt-2">
                            {/* Mövcud Actionlar */}
                            {workflow.filter(item => item.type === 'action').map(item => (
                                <WorkflowElement
                                    key={item.id}
                                    item={item}
                                    index={workflow.findIndex(i => i.id === item.id)}
                                    onRemove={handleRemoveElement}
                                    onToggleConfig={handleToggleConfig}
                                    onConfigChange={handleConfigChange}
                                />
                            ))}

                            {/* VERSİYA 5 - COMMAND PALETTE STYLE */}
                            <div className="relative">
                                {isAddingAction ? (
                                    <div className="w-full bg-[#11121d] border border-rose-500/30 rounded-[1.2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {/* Search Input Area */}
                                        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/5">
                                            <Plus size={16} className="text-rose-500 mr-3 rotate-45" onClick={() => setIsAddingAction(false)} />
                                            <input
                                                autoFocus
                                                placeholder="Search action or type '/'..."
                                                className="bg-transparent border-none outline-none text-sm text-zinc-200 w-full placeholder:text-zinc-600"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {/* Result List */}
                                        <div className="max-h-[220px] overflow-y-auto p-1 custom-scrollbar">
                                            {ELEMENT_PALETTE
                                                .filter(e => e.type === 'action' && e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((action) => (
                                                    <button
                                                        key={action.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAddElement(action);
                                                            setIsAddingAction(false);
                                                            setSearchTerm("");
                                                        }}
                                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 group transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{action.icon}</span>
                                                            <div className="text-left">
                                                                <div className="text-[11px] font-bold text-zinc-300 group-hover:text-white">{action.name}</div>
                                                                <div className="text-[9px] text-zinc-600 uppercase">Step {workflow.length + 1}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-[9px] font-mono text-zinc-700 bg-white/5 px-2 py-1 rounded opacity-0 group-hover:opacity-100 uppercase tracking-widest">
                                                            Select
                                                        </div>
                                                    </button>
                                                ))}

                                            {/* Heç nə tapılmayanda */}
                                            {ELEMENT_PALETTE.filter(e => e.type === 'action' && e.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                                <div className="py-8 text-center text-zinc-600 text-[10px] uppercase tracking-widest">
                                                    No action found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingAction(true)}
                                        className="w-full h-[54px] border border-dashed border-white/10 rounded-[1.2rem] flex items-center justify-center gap-2 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group"
                                    >
                                        <Plus size={14} className="text-zinc-600 group-hover:text-rose-400" />
                                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">
                    Quick Action Search
                </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
};

export default WorkflowBuilder;