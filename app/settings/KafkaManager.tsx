'use client';

import React, { useState, useEffect } from 'react';
import { Server, Plus, Trash2, Loader2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPES ---
interface KafkaBroker {
    id: string;
    name: string;
    url: string;
}

interface ActiveKafkaListener {
    brokerUrl: string;
    topic: string;
    groupId: string;
    running: boolean;
}

interface NewBrokerRequest {
    name: string;
    url: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

export default function KafkaManager() {
    const [brokers, setBrokers] = useState<KafkaBroker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [newBroker, setNewBroker] = useState<NewBrokerRequest>({ name: '', url: '' });


    const [brokerToDelete, setBrokerToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [listeners, setListeners] = useState<ActiveKafkaListener[]>([]);
    const [listenersLoading, setListenersLoading] = useState(false);

    useEffect(() => {
        fetchBrokers();
        fetchActiveListeners();

    }, []);


    const fetchBrokers = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/settings/kafka`);
            if (!res.ok) throw new Error('Failed to fetch brokers');
            const data: KafkaBroker[] = await res.json();
            setBrokers(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Could not load Kafka brokers");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActiveListeners = async () => {
        setListenersLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/kafka/listeners`);
            if (!res.ok) throw new Error("Failed to fetch listeners");

            const data: ActiveKafkaListener[] = await res.json();
            setListeners(data);
        } catch (e) {
            console.error(e);
            toast.error("Could not load active Kafka listeners");
        } finally {
            setListenersLoading(false);
        }
    };


    const handleAdd = async () => {
        if (!newBroker.name.trim() || !newBroker.url.trim()) {
            toast.error("Broker Name and URL are required");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/api/settings/kafka`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBroker)
            });

            if (!res.ok) throw new Error('Failed to add broker');

            toast.success("Broker added successfully!");
            setNewBroker({ name: '', url: '' });
            await fetchBrokers(); // Siyahını yenilə

        } catch (error) {
            console.error("Add Error:", error);
            toast.error("Failed to add broker");
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptDelete = (id: string) => {
        setBrokerToDelete(id);
    };

    const confirmDelete = async () => {
        if (!brokerToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`${BASE_URL}/api/settings/kafka/${brokerToDelete}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete');

            toast.success("Broker removed");
            setBrokerToDelete(null);
            await fetchBrokers();

        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Failed to delete broker");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 relative">

            {brokerToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">

                        {/* Modal Header */}
                        <div className="p-6 pb-0">
                            <div className="flex items-center gap-3 text-red-400 mb-2">
                                <div className="p-2 bg-red-900/20 rounded-lg">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Delete this broker?</h3>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">
                                Are you sure you want to delete this Kafka configuration?
                                This action cannot be undone and may affect associated mock flows.
                            </p>
                        </div>

                        {/* Modal Footer / Buttons */}
                        <div className="p-6 flex items-center justify-end gap-3 mt-2">
                            <button
                                onClick={() => setBrokerToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">

                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
                    <Server size={20} className="text-purple-400" />
                    Manage Kafka Brokers
                </h3>

                {/* --- ADD FORM --- */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8 items-start bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Broker Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Dev Cluster"
                            value={newBroker.name}
                            onChange={e => setNewBroker({...newBroker, name: e.target.value})}
                            disabled={isSubmitting}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none focus:border-purple-500 transition-colors disabled:opacity-50 placeholder-gray-500"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Bootstrap Servers</label>
                        <input
                            type="text"
                            placeholder="localhost:9092, localhost:9093"
                            value={newBroker.url}
                            onChange={e => setNewBroker({...newBroker, url: e.target.value})}
                            disabled={isSubmitting}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm outline-none focus:border-purple-500 transition-colors disabled:opacity-50 placeholder-gray-500 font-mono"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 pl-1">Separate with comma (,)</p>
                    </div>
                    <div className="md:col-span-2 pt-5">
                        <button
                            onClick={handleAdd}
                            disabled={isSubmitting}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:bg-purple-900/50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 active:scale-95"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            {isSubmitting ? 'Adding...' : 'Add Broker'}
                        </button>
                    </div>
                </div>

                {/* --- LIST --- */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-1">Configured Clusters</h4>

                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin mb-3 text-purple-500" size={24} />
                            <span className="text-sm">Loading brokers...</span>
                        </div>
                    ) : (
                        <>
                            {brokers.length > 0 ? (
                                brokers.map((broker) => (
                                    <div
                                        key={broker.id}
                                        className="group flex items-center justify-between p-4 bg-gray-700/40 hover:bg-gray-700/60 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-800 rounded-md text-purple-400 mt-0.5">
                                                <Server size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-200 text-sm">{broker.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800/80 px-1.5 py-0.5 rounded">URL</span>
                                                    <p className="text-xs text-gray-400 font-mono break-all">{broker.url}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            // Burada birbaşa handleDelete yox, promptDelete çağırırıq
                                            onClick={() => promptDelete(broker.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Remove Broker"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center bg-gray-900/20 rounded-lg border border-dashed border-gray-700">
                                    <AlertCircle size={32} className="mb-2 opacity-50" />
                                    <p>No brokers configured yet.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* --- ACTIVE LISTENERS --- */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
                        <Server size={20} className="text-green-400" />
                        Active Kafka Listeners
                    </h3>

                    {listenersLoading ? (
                        <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                            <Loader2 className="animate-spin mb-3 text-green-400" size={24} />
                            <span className="text-sm">Loading listeners...</span>
                        </div>
                    ) : (
                        <>
                            {listeners.length > 0 ? (
                                <div className="space-y-3">
                                    {listeners.map((l, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 bg-gray-700/40 rounded-lg border border-gray-700"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-800 rounded-md text-green-400 mt-0.5">
                                                    <Server size={18} />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-bold text-gray-200">
                                                        Topic: <span className="font-mono">{l.topic}</span>
                                                    </p>

                                                    <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                                                        {l.brokerUrl}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                      Group
                    </span>
                                                        <span className="text-[11px] text-gray-300 font-mono">
                      {l.groupId}
                    </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span
                                                className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                    l.running
                                                        ? "bg-green-900/40 text-green-400"
                                                        : "bg-red-900/40 text-red-400"
                                                }`}
                                            >
                {l.running ? "RUNNING" : "STOPPED"}
              </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500 bg-gray-900/20 rounded-lg border border-dashed border-gray-700">
                                    <AlertCircle size={28} className="mb-2 opacity-50 mx-auto" />
                                    <p>No active Kafka listeners.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}