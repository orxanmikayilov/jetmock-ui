// app/settings/page.tsx
'use client';

import React, { useState } from 'react';
import KafkaManager from '../../app/settings/KafkaManager';

type TabType = 'kafka';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('kafka');

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">System Settings</h1>
                <p className="text-gray-400 text-sm">Manage your external connections and data sources.</p>
            </div>

            {/* Custom Tabs Navigation */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('kafka')}
                    className={`pb-3 px-6 text-sm font-medium transition-all relative ${
                        activeTab === 'kafka'
                            ? 'text-purple-400 border-b-2 border-purple-400'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Kafka Brokers
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'kafka' && (
                    <div className="animate-in fade-in duration-300">
                        <KafkaManager />
                    </div>
                )}
            </div>
        </div>
    );
}