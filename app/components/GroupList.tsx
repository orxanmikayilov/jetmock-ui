// components/GroupList.tsx

import React from 'react';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
    fromService: string;
    toService: string;
    isActive: boolean;
    mockCount: number;
    createdAt: string;
}

interface Props {
    groups: Group[];
    onToggleStatus: (id: string, newStatus: boolean) => void;
    onDeleteGroup: (id: string) => void;
}

const GroupList: React.FC<Props> = ({ groups, onToggleStatus, onDeleteGroup }) => {
    return (
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Service Flow (From ➡️ To)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Mock Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-700 transition duration-150 ease-in-out">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                    href={`/groups/${group.id}`}
                                    className="text-blue-400 hover:text-blue-300 transition duration-150 block"
                                >
                                    <div className="font-bold text-lg text-white">
                                        {group.fromService}
                                        <span className="mx-2 text-blue-500">➡️</span>
                                        {group.toService}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">
                                        PATH: /{group.name}
                                    </div>
                                </Link>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {group.mockCount}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {new Date(group.createdAt).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                <button
                                    onClick={() => onToggleStatus(group.id, !group.isActive)}
                                    className={`p-2 rounded-md text-white transition-colors text-xs ${
                                        group.isActive
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    {group.isActive ? 'Deactivate' : 'Activate'}
                                </button>

                                <button
                                    onClick={() => onDeleteGroup(group.id)}
                                    className="p-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-xs"
                                >
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

export default GroupList;
