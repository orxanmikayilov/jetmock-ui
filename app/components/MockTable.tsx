// components/MockTable.tsx

import React from 'react';

import { useRouter } from "next/navigation";
interface MockScenario {
    id: string;
    trigger: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface Props {
    groupId: string;
    mocks: MockScenario[];
    onToggleStatus: (mockId: string, newStatus: boolean) => void;
    onDelete: (id: string) => void;   //  NEW
}

const MockTable: React.FC<Props> = ({groupId, mocks, onToggleStatus,onDelete }) => {

    const router = useRouter();

    return (
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Name / Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Trigger
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {mocks.map((mock) => (
                        <tr key={mock.id} className="hover:bg-gray-700 transition duration-150 ease-in-out">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-semibold text-white">{mock.name}</div>

                                <div
                                    className={`text-xs p-1 rounded inline-block mt-1 ${
                                        mock.trigger === 'API'
                                            ? 'bg-blue-900 text-blue-300'
                                            : 'bg-yellow-900 text-yellow-300'
                                    }`}
                                >
                                    {mock.description}
                                </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {mock.trigger}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    onClick={() => onToggleStatus(mock.id, !mock.isActive)}
                                    className={`p-2 rounded-md text-white text-xs font-medium transition-colors ${
                                        mock.isActive
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                >
                                    {mock.isActive ? "Deactivate" : "Activate"}
                                </button>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">

                                <button
                                    onClick={() => router.push(`/groups/${groupId}/edit/${mock.id}`)}
                                    className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs">
                                    Edit
                                </button>

                                <button
                                    onClick={() => onDelete(mock.id)}
                                    className="ml-2 p-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-xs">
                                    🗑️ Delete
                                </button>

                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MockTable;
