// components/CreateGroupForm.tsx

'use client';

import React, { useState } from 'react';

interface Props {
    onCreateGroup: (fromService: string, toService: string) => void;
    isLoading: boolean;
}

const CreateGroupForm: React.FC<Props> = ({ onCreateGroup, isLoading }) => {
    const [fromService, setFromService] = useState('');
    const [toService, setToService] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (fromService.trim() && toService.trim() && !isLoading) {
            onCreateGroup(fromService.trim(), toService.trim());
            setFromService('');
            setToService('');
        }
    };

    const isFormValid = fromService.trim() && toService.trim();
    const previewName = isFormValid ? `${fromService.toLowerCase().replace(/ /g, '_')}_to_${toService.toLowerCase().replace(/ /g, '_')}` : '';

    return (
        <div className="p-5 border border-gray-700 rounded-lg shadow-md bg-gray-800 text-white">
            <h3 className="text-xl font-semibold mb-4">➕ Create New Mock Group (Service A ➡️ Service B)</h3>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">

                <input
                    type="text"
                    value={fromService}
                    onChange={(e) => setFromService(e.target.value)}
                    placeholder="From Service (e.g., Auth Service)"
                    className="flex-grow p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                />

                <input
                    type="text"
                    value={toService}
                    onChange={(e) => setToService(e.target.value)}
                    placeholder="To Service (e.g., User Service)"
                    className="flex-grow p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    className={`px-4 py-2 text-white font-medium rounded-md transition-colors whitespace-nowrap ${
                        isFormValid && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
                    }`}
                    disabled={isLoading || !isFormValid}
                >
                    {isLoading ? 'Creating...' : 'Create Group'}
                </button>
            </form>

            {isFormValid && (
                <p className="mt-3 text-sm text-gray-400">
                    Generated Group Path: <code className="text-yellow-400">{previewName}</code>
                </p>
            )}
        </div>
    );
};

export default CreateGroupForm;