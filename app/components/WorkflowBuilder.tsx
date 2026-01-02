// components/SmartWorkflowBuilder.tsx

'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";

import {closestCenter, DndContext, MouseSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';

import WorkflowElement from './WorkflowElement';
import toast from "react-hot-toast";

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
    {type: 'action', name: 'Kafka Publish Event', icon: '📢', config: {topic: '', broker: '', payload: '{ "status": "sent" }'}},
    {type: 'action', name: 'Global Variables', icon: '📢', config: {variable: ''}},
];

const WorkflowBuilder: React.FC<Props> = ({initialWorkflow, groupId, mockId, isLoading}) => {

    const router = useRouter();
    const [workflow, setWorkflow] = useState<WorkflowItem[]>([]);
    const [mockName, setMockName] = useState(initialWorkflow?.name || '');
    const [dragError, setDragError] = useState<string | null>(null);

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

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            if (isWorkflowValid) saveScenarioToBackend();
        }} className="space-y-6">

            <div className="p-4 bg-gray-800 rounded-lg shadow border border-gray-700">
                <label className="block text-sm font-medium text-gray-300 mb-1">Mock Scenario Name</label>
                <input type="text" value={mockName} onChange={(e) => setMockName(e.target.value)}
                       placeholder="User Registration Flow"
                       className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white" required
                       disabled={isLoading}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">

                <div className="md:col-span-1 p-4 bg-gray-800 rounded-lg space-y-3 shadow">

                    {/* LOGIC / CONDITION */}
                    <h4 className="font-semibold text-lg text-yellow-300 border-b border-gray-700 pb-2">Condition</h4>
                    {LOGIC_ELEMENTS.map((element, index) => (
                        <div
                            key={index}
                            onClick={() => handleAddElement(element)}
                            className={`p-3 rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors text-sm text-white flex items-center gap-2`}
                        >
                            <span className="text-lg">{element.icon}</span> {element.name}
                        </div>
                    ))}

                    {/* TRIGGERLƏR */}
                    <h4 className="font-semibold text-lg text-blue-300 border-b border-gray-700 pb-2 mt-6">Starting
                        Triggers</h4>
                    {TRIGGER_ELEMENTS.map((element, index) => (
                        <div
                            key={index}
                            onClick={() => handleAddElement(element)}
                            className={`p-3 rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors text-sm text-white flex items-center gap-2`}
                        >
                            <span className="text-lg">{element.icon}</span> {element.name}
                        </div>
                    ))}

                    {/* ACTION KOMPONENTLƏR */}
                    <h4 className="font-semibold text-lg text-pink-300 border-b border-gray-700 pb-2 mt-6">Action
                        Components</h4>
                    {ACTION_ELEMENTS.map((element, index) => (
                        <div
                            key={index}
                            onClick={() => handleAddElement(element)}
                            className={`p-3 rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors text-sm text-white flex items-center gap-2`}
                        >
                            <span className="text-lg">{element.icon}</span> {element.name}
                        </div>
                    ))}
                </div>

                <div className="md:col-span-3 p-4 bg-gray-800 rounded-lg shadow border-2 border-dashed border-gray-600">
                    <h4 className="font-semibold text-lg text-white mb-4">Scenario Flow</h4>

                    {dragError && (
                        <div className='mb-4 p-3 bg-red-900 border border-red-500 rounded text-red-100 text-sm'>
                            ⚠️ {dragError}
                        </div>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={workflow.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {workflow.length === 0 ? (
                                <p className="text-gray-500 text-center py-12">Click an element on the left to start the
                                    flow.</p>
                            ) : (
                                workflow.map((item, index) => (
                                    <WorkflowElement
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        onRemove={handleRemoveElement}
                                        onToggleConfig={handleToggleConfig}
                                        onConfigChange={handleConfigChange}
                                    />
                                ))
                            )}
                        </SortableContext>
                    </DndContext>

                    {isApiTrigger && !hasResponse && (
                        <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded text-red-200">
                            ⚠️ API Trigger requires an HTTP Response.
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || !isWorkflowValid}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        !isWorkflowValid || isLoading ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                    {isLoading ? 'Saving...' : 'Save Scenario'}
                </button>
            </div>
        </form>
    );
};

export default WorkflowBuilder;