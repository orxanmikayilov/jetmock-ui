// app/page.tsx

import React from 'react';
import GroupListClient from './components/GroupListClient';

interface Group {
    id: string;
    name: string;
    fromService: string;
    toService: string;
    isActive: boolean;
    mockCount: number;
    createdAt: string;
}

const HomePage = async () => {

    return (
        <div className="min-h-screen bg-gray-900 text-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-white flex items-center gap-4">
                    <span className="text-blue-400">🚀</span> Mock Group Management
                </h1>

                <GroupListClient />
            </div>
        </div>
    );
};

export default HomePage;