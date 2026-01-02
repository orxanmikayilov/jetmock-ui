// app/groups/[id]/create/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import WorkflowBuilder from '../../../components/WorkflowBuilder';

interface WorkflowItem {
    id: string;
    type: 'trigger' | 'response' | 'action' | 'logic';
    name: string;
    config: any;
    isOpen?: boolean;
    isPaired?: boolean;
}

interface WorkflowData {
    name: string;
    items: WorkflowItem[];
}

const CreateMockPage: React.FC = () => {
    const params = useParams();

    const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [fromService, setFromService] = useState('');
    const [toService, setToService] = useState('');

    if (!groupId) {
        return (
            <div className="p-8 text-red-500 bg-gray-900 min-h-screen">
                Group ID not found.
            </div>
        );
    }

    const fetchGroupDetails = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/groups/${groupId}`, {
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

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                <Link
                    href={`/groups/${groupId}`}
                    className="text-blue-400 hover:text-blue-500 transition-colors mb-4 inline-block"
                >
                    &larr; Back to {fromService?.toUpperCase()} ➡️ {toService?.toUpperCase()} Group
                </Link>

                <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
                    ✨ Create Smart Mock Scenario Flow
                </h1>

                <p className="text-gray-400 mb-6">
                    Add elements, adjust the flow, and configure each step inline without leaving the context.
                </p>

                <WorkflowBuilder groupId={groupId} isLoading={false} />
            </div>
        </div>
    );
};

export default CreateMockPage;
