// app/groups/[id]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MockTable from '../../components/MockTable';
import ConfirmModal from '../../components/ConfirmModal';


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface GroupResponse {
    id: string;
    name: string; // example: "loan_to_card"
}

interface MockScenario {
    id: string;
    name: string;
    description: string;
    trigger: string;
    isActive: boolean;
}

const GroupDetailPage: React.FC = () => {
    const params = useParams();
    const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [fromService, setFromService] = useState<string>('');
    const [toService, setToService] = useState<string>('');
    const [mocks, setMocks] = useState<MockScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const openDeleteModal = (id: string) => {
        setDeleteId(id);
        setModalOpen(true);
    };

    const cancelDelete = () => {
        setModalOpen(false);
        setDeleteId(null);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`${BASE_URL}/v1/mocks/${deleteId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                console.error("Failed to delete mock");
                return;
            }

            // UI-dən sil
            setMocks(prev => prev.filter(m => m.id !== deleteId));

        } catch (err) {
            console.error(err);
        }

        setModalOpen(false);
        setDeleteId(null);
    };


    if (!groupId) {
        return <div className="p-8 text-red-500">Group ID not found.</div>;
    }

    const fetchGroupDetails = async () => {
        try {
            const res = await fetch(`${BASE_URL}/v1/groups/${groupId}`, {
                cache: 'no-store',
            });

            const group: GroupResponse = await res.json();

            const [from, to] = group.name.split('_to_');
            setFromService(from || '');
            setToService(to || '');

        } catch (err) {
            console.error("Group detail fetch error:", err);
        }
    };

    const fetchMocks = async () => {
        try {
            const res = await fetch(`${BASE_URL}/v1/mocks?groupId=${groupId}`, {
                cache: 'no-store',
            });

            const data = await res.json();

            const transformed = data.map((m: any) => ({
                ...m,
                isActive: true,
            }));

            setMocks(transformed);

        } catch (err) {
            console.error("Mocks fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupDetails();
        fetchMocks();
    }, [groupId]);

    const handleToggleMockStatus = (mockId: string, newStatus: boolean) => {
        setMocks(prev =>
            prev.map(mock =>
                mock.id === mockId ? { ...mock, isActive: newStatus } : mock
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 p-8">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-3xl font-bold mb-2 text-white">
                    <span className="text-blue-400">{fromService?.toUpperCase()}</span>
                    <span className="mx-2 text-gray-500">➡️</span>
                    <span className="text-blue-400">{toService?.toUpperCase()}</span>
                </h1>

                <p className="text-gray-400 mb-8">
                    Group ID:{" "}
                    <code className="bg-gray-700 p-1 rounded text-sm text-yellow-300">
                        {groupId}
                    </code>
                </p>

                <div className="flex justify-end mb-6">
                    <Link href={`/groups/${groupId}/create`}>
                        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2">
                            ✨ Create New Mock Scenario
                        </button>
                    </Link>
                </div>

                {loading ? (
                    <p className="text-blue-300">Loading...</p>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold mt-12 mb-4 text-white">
                            Existing Mock Scenarios ({mocks.length})
                        </h2>

                        <MockTable
                            groupId={groupId}
                            mocks={mocks}
                            onToggleStatus={handleToggleMockStatus}
                            onDelete={openDeleteModal}
                        />
                        <ConfirmModal
                            open={isModalOpen}
                            title="Delete mock?"
                            message="Are you sure you want to delete this mock scenario? This action cannot be undone."
                            onConfirm={confirmDelete}
                            onCancel={cancelDelete}
                        />
                    </>
                )}

            </div>
        </div>
    );
};

export default GroupDetailPage;
