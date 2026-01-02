'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import WorkflowBuilder from '../../../../components/WorkflowBuilder';

interface WorkflowItem {
    id: string;
    type: 'trigger' | 'response' | 'action' | 'logic';
    name: string;
    config: any;
    isOpen?: boolean;
    isPaired?: boolean;
}

interface MockResponse {
    id: string;
    name: string;
    items: WorkflowItem[];
}

const EditMockPage: React.FC = () => {
    const params = useParams();

    const groupId = Array.isArray(params.id) ? params.id[0] : params.id;
    const mockId = Array.isArray(params.mockId) ? params.mockId[0] : params.mockId;

    const [mockData, setMockData] = useState<MockResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [fromService, setFromService] = useState('');
    const [toService, setToService] = useState('');

    if (!groupId || !mockId) {
        return (
            <div className="p-8 text-red-500 bg-gray-900 min-h-screen">
                Missing required parameters.
            </div>
        );
    }

    // Fetch group details (same as create page)
    const fetchGroupDetails = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/mocks/${mockId}`, {
                cache: 'no-store',
            });

            const group = await res.json();
            const [from, to] = group.name.split('_to_');
            setFromService(from || '');
            setToService(to || '');
        } catch (err) {
            console.error('Group detail fetch error:', err);
        }
    };
    function mapStepToWorkflowItem(step: any): WorkflowItem {
        switch (step.elementName) {

            case "CONDITION":
                return {
                    id: crypto.randomUUID(),
                    type: "logic",
                    name: "Conditional Filter",
                    config: {
                        mode: "query",
                        spel: step.expression,
                        rules: []
                    }
                };

            case "API_TRIGGER_REQUEST":
                return {
                    id: crypto.randomUUID(),
                    type: "trigger",
                    name: "API Request Trigger",
                    config: {
                        method: step.method,
                        endpoint: step.path
                    }
                };3

            case "API_TRIGGER_RESPONSE":
                return {
                    id: crypto.randomUUID(),
                    type: "response",
                    name: "HTTP Response",
                    config: {
                        status: step.status,
                        latency: step.latency,
                        headers: step.header,
                        body: step.body
                    },
                    isPaired: true
                };

            case "KAFKA_TRIGGER":
                return {
                    id: crypto.randomUUID(),
                    type: "trigger",
                    name: "Kafka Event Trigger",
                    config: {
                        topic: step.topic,
                        broker: step.broker
                    }
                };

            case "CALLBACK_API":
                return {
                    id: crypto.randomUUID(),
                    type: "action",
                    name: "Callback API Call",
                    config: {
                        method: step.method,
                        url: step.path,
                        latency: step.latency,
                        headers: step.header,
                        payload: step.body,
                        param: step.param
                    }
                };

            case "KAFKA_PUBLISHER":
                return {
                    id: crypto.randomUUID(),
                    type: "action",
                    name: "Kafka Publish Event",
                    config: {
                        topic: step.topic,
                        broker: step.broker,
                        payload: step.payload
                    }
                };

            case "GLOBAL_VARIABLE":
                return {
                    id: crypto.randomUUID(),
                    type: "action",
                    name: "Global Variables",
                    config: {
                       variable: step.variable,
                    }
                };

            default:
                console.warn("Unknown elementName:", step.elementName);
                return {
                    id: crypto.randomUUID(),
                    type: "action",
                    name: "Unknown",
                    config: step
                };
        }
    }

    // Fetch mock scenario
    const fetchMock = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/mocks/${mockId}`, {
                cache: "no-store"
            });

            const data = await res.json();

            const items = data.flowSteps
                .sort((a, b) => a.orderNumber - b.orderNumber)
                .map(step => mapStepToWorkflowItem(step));

            setMockData({
                id: data.id,
                name: data.name,
                items: items
            });

        } catch (error) {
            console.error("Failed to fetch mock scenario:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupDetails();
        fetchMock();
    }, [mockId]);


    if (loading) {
        return <div className="p-8 text-gray-300">Loading...</div>;
    }

    if (!mockData) {
        return <div className="p-8 text-red-400">Mock scenario not found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                <Link
                    href={`/groups/${groupId}`}
                    className="text-blue-400 hover:text-blue-500 transition-colors mb-4 inline-block"
                >
                    &larr; Back to {fromService.toUpperCase()} ➡️ {toService.toUpperCase()} Group
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
                    ✏️ Edit Mock Scenario
                </h1>

                <p className="text-gray-400 mb-6">
                    You can update, reorder, or delete elements inside the workflow.
                </p>

                {/* 🔥 IMPORTANT: WorkflowBuilder must receive initialData */}
                <WorkflowBuilder
                    mockId={mockId}
                    groupId={groupId}
                    isLoading={false}
                    initialWorkflow={mockData}
                />
            </div>
        </div>
    );
};

export default EditMockPage;
