'use client';

import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";

// ---------------- INTERFACES ----------------
interface WorkflowItem {
    id: string;
    type: 'trigger' | 'response' | 'action' | 'logic';
    name: string;
    config: any;
}

interface LogicRule {
    id: string;
    target: 'header' | 'body' | 'query';
    property: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'matches' | 'exists';
    value: string;
    invert: boolean;
}

interface Props {
    item: WorkflowItem;
    onConfigChange: (newConfig: any) => void;
}


interface HeaderRow {
    id: string;
    key: string;
    value: string;
    isActive: boolean;
}

// Kafka Broker Interface
interface KafkaBroker {
    id: string;
    name: string;
    url: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

// ---------------- SPEL GENERATOR ----------------
export const generateSpelFromRules = (rules: LogicRule[]): string => {
    if (!rules || rules.length === 0) return "";

    const expressions = rules.map(rule => {
        let path = "";

        switch (rule.target) {
            case 'header': path = `#trigger.header['${rule.property}']`; break;
            case 'body': path = `#trigger.body['${rule.property}']`; break;
            case 'query': path = `#trigger.param['${rule.property}']`; break;
        }

        let expr = "";

        switch (rule.operator) {
            case 'equals': expr = `${path} == '${rule.value}'`; break;
            case 'not_equals': expr = `${path} != '${rule.value}'`; break;
            case 'contains': expr = `${path}.toString().contains('${rule.value}')`; break;
            case 'matches': expr = `${path}.matches('${rule.value}')`; break;
            case 'exists': expr = `${path} != null`; break;
        }

        return rule.invert ? `!(${expr})` : expr;
    });

    return expressions.join(' && ');
};
const VariablesEditor = ({ variable, onChange }: { variable: any[], onChange: (updated: any[]) => void }) => {

    const updateField = (index: number, field: string, value: string) => {
        const updated = [...variable];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated); // Birbaşa massivi göndəririk
    };

    const addRow = () => {
        const newRow = { id: crypto.randomUUID(), key: '', value: '' };
        onChange([...variable, newRow]);
    };

    const deleteRow = (index: number) => {
        onChange(variable.filter((_, i) => i !== index));
    };

    return (
        <div className="border border-gray-500 rounded-lg overflow-hidden bg-gray-600/50 mt-2">
            <div className="grid grid-cols-[1fr_1fr_40px] bg-gray-600 border-b border-gray-500 text-[10px] uppercase font-bold text-gray-300">
                <div className="p-2 border-r border-gray-500">Variable Key</div>
                <div className="p-2">Value</div>
                <div className="p-2"></div>
            </div>

            {variable.map((v, index) => (
                <div key={v.id} className="grid grid-cols-[1fr_1fr_40px] border-b border-gray-500/50 items-center hover:bg-gray-600/80 transition-colors">
                    <div className="border-r border-gray-500/50">
                        <input
                            value={v.key}
                            onChange={(e) => updateField(index, 'key', e.target.value)}
                            className="w-full bg-transparent p-2 text-xs text-orange-200 outline-none font-mono"
                        />
                    </div>
                    <div className="border-r border-gray-500/50">
                        <input
                            value={v.value}
                            onChange={(e) => updateField(index, 'value', e.target.value)}
                            className="w-full bg-transparent p-2 text-xs text-white outline-none font-mono"
                        />
                    </div>
                    <button type="button" onClick={() => deleteRow(index)} className="text-gray-400 hover:text-red-400 text-xs font-bold">✕</button>
                </div>
            ))}

            <button
                type="button"
                onClick={addRow}
                className="w-full p-2 text-[10px] text-gray-400 hover:bg-gray-600 hover:text-orange-400 transition-colors border-t border-gray-500/30"
            >
                + Add Variable Line
            </button>
        </div>
    );
};

const HeadersEditor = ({jsonString, onChange}: { jsonString: string, onChange: (val: string) => void }) => {
    // JSON string-i cədvəl üçün array-ə çeviririk
    const parseInitHeaders = (): HeaderRow[] => {
        try {
            const obj = JSON.parse(jsonString || '{}');
            // Əgər obyekt boşdursa, default olaraq Content-Type əlavə edirik (ilk renderdə görünməsi üçün)
            if (Object.keys(obj).length === 0) {
                return [{id: 'default-json', key: 'Content-Type', value: 'application/json', isActive: true}];
            }
            return Object.entries(obj).map(([k, v], i) => ({
                id: i.toString() + k,
                key: k,
                value: String(v),
                isActive: true
            }));
        } catch {
            return [];
        }
    };

    const [rows, setRows] = useState<HeaderRow[]>(() => parseInitHeaders());

    const syncChanges = (currentRows: HeaderRow[]) => {
        const newObj: Record<string, string> = {};
        currentRows.forEach(r => {
            if (r.isActive && r.key.trim() !== '') {
                newObj[r.key] = r.value;
            }
        });
        onChange(JSON.stringify(newObj, null, 2));
    };

    const addRow = () => {
        const newRow = {id: Date.now().toString(), key: '', value: '', isActive: true};
        const updatedRows = [...rows, newRow];
        setRows(updatedRows);
    };

    const updateRow = (index: number, field: keyof HeaderRow, value: any) => {
        const newRows = [...rows];
        newRows[index] = {...newRows[index], [field]: value};
        setRows(newRows);
        syncChanges(newRows);
    };

    const deleteRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        syncChanges(newRows);
    };

    return (
        <div className="border border-gray-500 rounded-lg overflow-hidden bg-gray-600/50 mt-2 shadow-sm">
            {/* Table Header - Rəngi inputlarla eyniləşdirildi (boz-600) */}
            <div
                className="grid grid-cols-[40px_1fr_1fr_40px] bg-gray-600 border-b border-gray-500 text-[10px] uppercase font-bold text-gray-300">
                <div className="p-2 text-center flex items-center justify-center opacity-50">Active</div>
                <div className="p-2 border-r border-gray-500 border-l border-gray-500">Key</div>
                <div className="p-2 border-r border-gray-500">Value</div>
                <div className="p-2 text-center"></div>
            </div>

            {/* Rows */}
            {rows.map((row, index) => (
                <div key={row.id}
                     className="grid grid-cols-[40px_1fr_1fr_40px] border-b border-gray-500/50 hover:bg-gray-600/80 group items-center transition-colors">
                    {/* Checkbox */}
                    <div className="flex items-center justify-center h-full">
                        <input
                            type="checkbox"
                            checked={row.isActive}
                            onChange={(e) => updateRow(index, 'isActive', e.target.checked)}
                            className="rounded bg-gray-700 border-gray-500 text-green-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                        />
                    </div>

                    {/* Key Input */}
                    <div className="border-r border-l border-gray-500/50 h-full">
                        <input
                            type="text"
                            value={row.key}
                            onChange={(e) => updateRow(index, 'key', e.target.value)}
                            placeholder="Key"
                            className="w-full h-full bg-transparent p-2 text-xs text-white font-medium outline-none placeholder-gray-400 font-mono"
                        />
                    </div>

                    {/* Value Input */}
                    <div className="border-r border-gray-500/50 h-full">
                        <input
                            type="text"
                            value={row.value}
                            onChange={(e) => updateRow(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="w-full h-full bg-transparent p-2 text-xs text-blue-200 outline-none placeholder-gray-400 font-mono"
                        />
                    </div>

                    {/* Delete Button */}
                    <div className="flex items-center justify-center h-full">
                        <button
                            type="button"
                            onClick={() => deleteRow(index)}
                            className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 px-2 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            {/* Add Button */}
            <button
                type="button"
                onClick={addRow}
                className="w-full p-2 text-xs text-gray-400 hover:bg-gray-600 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
                + Add New Header
            </button>
        </div>
    );
};

// ---------------- MAIN COMPONENT ----------------
const InlineConfigForm: React.FC<Props> = ({ item, onConfigChange }) => {

    // State to store fetched brokers
    const [brokers, setBrokers] = useState<KafkaBroker[]>([]);

    // Fetch brokers if the item is a Kafka Action
    useEffect(() => {
        const isKafkaTrigger = item.type === 'trigger' && item.name.includes('Kafka');
        const isKafkaAction = item.type === 'action' && item.name.includes('Kafka Publish');

        if (isKafkaTrigger || isKafkaAction) {
            const fetchBrokers = async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/settings/kafka`);
                    if (res.ok) {
                        const data = await res.json();
                        setBrokers(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch brokers", error);
                    // Silent fail or toast error
                }
            };
            fetchBrokers();
        }
    }, [item.type, item.name]);


    const handleLocalConfigChange = (field: string, value: any) => {
        onConfigChange({ ...item.config, [field]: value });
    };

    // JSON Beautify helper
    const handleJsonBeautify = (field: 'body' | 'headers' | 'filter' | 'payload') => {
        const jsonString = item.config[field];
        if (!jsonString) return;

        try {
            const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);
            handleLocalConfigChange(field, formattedJson);
        } catch (e) {
            toast.error("Format Error: JSON is invalid");
        }
    };

    // Add / remove / update rule
    const addRule = () => {
        const newRule: LogicRule = {
            id: Math.random().toString(36).substring(2, 9),
            target: 'body',
            property: '',
            operator: 'equals',
            value: '',
            invert: false
        };

        handleLocalConfigChange('rules', [...(item.config.rules || []), newRule]);
    };

    const removeRule = (ruleId: string) => {
        handleLocalConfigChange(
            'rules',
            (item.config.rules || []).filter((r: LogicRule) => r.id !== ruleId)
        );
    };


    const updateRule = (ruleId: string, field: keyof LogicRule, value: any) => {
        const newRules = (item.config.rules || []).map((r: LogicRule) =>
            r.id === ruleId ? { ...r, [field]: value } : r
        );
        handleLocalConfigChange('rules', newRules);
    };

    const getVariablesForUI = () => {
        const raw = item.config?.variable;

        if (!raw || raw === "") return [];

        if (Array.isArray(raw)) return raw;

        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Parse error:", e);
            return []; // Xətalı JSON-dursa boş massiv qaytar
        }
    };
    return (
        <div className='mt-4 p-3 bg-gray-700 rounded space-y-3'>
            <h5 className='font-semibold text-sm text-white border-b border-gray-600 pb-2'>Details Configuration</h5>

            {/* 1. TRIGGER Configuration */}
            {item.type === 'trigger' && (
                <div className="space-y-4">
                    {item.name.includes('API') && (
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-400 mb-1">Method</label>
                                <select value={item.config.method || 'GET'} onChange={(e) => handleLocalConfigChange('method', e.target.value)} className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" >
                                    <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option><option value="PATCH">PATCH</option>
                                </select>
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-medium text-gray-400 mb-1">Endpoint Path</label>
                                <input type="text" value={item.config.endpoint || ''} onChange={(e) => handleLocalConfigChange('endpoint', e.target.value)} placeholder="/api/v1/users/:id" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" />
                            </div>
                        </div>
                    )}
                    {item.name.includes('Kafka') && (
                        <div className="space-y-4">
                            {/* KAFKA TRIGGER ÜÇÜN BROKER SEÇİMİ (FIELD: broker) */}
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Kafka Broker Cluster</label>
                                <select
                                    value={item.config.broker || ''}
                                    onChange={(e) => handleLocalConfigChange('broker', e.target.value)}
                                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white"
                                >
                                    <option value="">-- Select Broker --</option>
                                    {brokers.map((broker) => (
                                        <option key={broker.id} value={broker.id}>
                                            {broker.name} ({broker.url})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Kafka Topic Name</label>
                                <input type="text" value={item.config.topic || ''} onChange={(e) => handleLocalConfigChange('topic', e.target.value)} placeholder="E.g.: ORDER_CREATED_EVENTS" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 2. RESPONSE Configuration */}
            {item.type === 'response' && (
                <div className="space-y-4">
                    <h6 className="text-sm font-bold text-green-300">Basic Response Parameters</h6>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">HTTP Status Code</label><input type="number" value={item.config.status || 200} onChange={(e) => handleLocalConfigChange('status', parseInt(e.target.value))} min="100" max="599" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" /></div>
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">Latency (ms) ⏱️</label><input type="number" value={item.config.latency || 0} onChange={(e) => handleLocalConfigChange('latency', parseInt(e.target.value))} min="0" placeholder="E.g.: 300" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" /></div>
                    </div>

                    {/* RESPONSE HEADERS */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-medium text-gray-400">Response Headers</label>
                        </div>
                        <HeadersEditor
                            jsonString={item.config.headers || '{"Content-Type": "application/json"}'}
                            onChange={(newJson) => handleLocalConfigChange('headers', newJson)}
                        />
                    </div>

                    {/* RESPONSE BODY */}
                    <div>
                        <div className="flex justify-between items-end mb-1"><label className="block text-xs font-medium text-gray-400">Response Body</label><button type="button" onClick={() => handleJsonBeautify('body')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">✨ Format JSON</button></div>
                        <textarea value={item.config.body || '{\n  "": ""\n}'} onChange={(e) => handleLocalConfigChange('body', e.target.value)} rows={8} placeholder='{"id": 123, "name": "{{ request.body.name }}"}' className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white font-mono resize-none" />
                        <span className="block text-blue-400 text-xs mt-1">Templating: {"{{ request.body.user }}"}</span>
                    </div>
                </div>
            )}

            {/* 3. ACTION & LOGIC Configuration */}
            {item.type === 'action' && item.name.includes("Kafka Publish") && (
                <div className="space-y-4 p-3 bg-gray-700 rounded-lg">
                    <h6 className="text-sm font-bold text-pink-300">Kafka Publish Parameters</h6>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Kafka Broker Cluster</label>
                        <select
                            value={item.config.brokerId || ''}
                            onChange={(e) => handleLocalConfigChange('brokerId', e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white"
                        >
                            <option value="">-- Select Broker --</option>
                            {/* Datanı API-dən render edirik */}
                            {brokers.map((broker) => (
                                <option key={broker.id} value={broker.id}>
                                    {broker.name} ({broker.url})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div><label className="block text-xs font-medium text-gray-400 mb-1">Topic Name</label><input type="text" value={item.config.topic || ''} onChange={(e) => handleLocalConfigChange('topic', e.target.value)} placeholder="E.g.: USER_CREATED_EVENT" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" /></div>
                    <div><label className="block text-xs font-medium text-gray-400 mb-1">Payload (JSON)</label><textarea value={item.config.payload || '{\n  "message": "sent"\n}'} onChange={(e) => handleLocalConfigChange('payload', e.target.value)} rows={4} className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white font-mono resize-none" /></div>
                </div>
            )}

            {/* 3. ACTION & LOGIC Configuration hissəsində */}
            {item.type === 'action' && item.name.includes("Global Variables") && (
                <div className="space-y-4 p-3 bg-gray-700 rounded-lg">
                    <h6 className="text-sm font-bold text-orange-300 flex items-center gap-2">
                        <span>🔑</span> Global Environment Variables
                    </h6>

                    <VariablesEditor
                        variable={getVariablesForUI()}
                        onChange={(updatedVars) => {
                            const jsonString = JSON.stringify(updatedVars);
                            handleLocalConfigChange('variable', jsonString);
                        }}
                    />

                    <p className="text-[10px] text-gray-400 italic mt-2">
                        ℹ️ Data is stored as a JSON string in the backend.
                    </p>
                </div>
            )}

            {item.type === 'action' && item.name.includes("Callback API Call") && (
                <div className="space-y-4 p-3 bg-gray-700 rounded-lg">
                    <h6 className="text-sm font-bold text-pink-300">Callback API Parameters</h6>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3"><label className="block text-xs font-medium text-gray-400 mb-1">Destination URL</label><input type="text" value={item.config.url || ''} onChange={(e) => handleLocalConfigChange('url', e.target.value)} placeholder="https://external-service.com/callback" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" /></div>
                        <div><label className="block text-xs font-medium text-gray-400 mb-1">Method</label><select value={item.config.method || 'POST'} onChange={(e) => handleLocalConfigChange('method', e.target.value)} className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" ><option value="POST">POST</option><option value="PUT">PUT</option></select></div>
                        <div className="col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Latency (ms) ⏱️</label><input type="number" value={item.config.latency || 0} onChange={(e) => handleLocalConfigChange('latency', parseInt(e.target.value))} min="0" placeholder="0" className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white" /></div>
                    </div>

                    {/* REQUEST HEADERS (NEW EDITOR) */}
                    <div>
                        <div className="flex justify-between items-end mb-1"><label
                            className="block text-xs font-medium text-gray-400">Request Headers</label></div>
                        <HeadersEditor
                            jsonString={item.config.headers || '{"Content-Type": "application/json"}'}
                            onChange={(newJson) => handleLocalConfigChange('headers', newJson)}
                        />
                    </div>

                    <div><label className="block text-xs font-medium text-gray-400 mb-1">Payload (JSON)</label><textarea
                        value={item.config.payload || '{\n  "status": "callback_ok"\n}'}
                        onChange={(e) => handleLocalConfigChange('payload', e.target.value)} rows={4}
                        className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white font-mono resize-none"/>
                    </div>
                </div>
            )}

            {item.type === 'logic' && (
                <div className="space-y-4">

                    {/* Mode Toggle */}
                    <div className="flex justify-between items-center">
                        <label className="block text-xs font-medium text-gray-400">Configuration Mode</label>
                        <div className="flex bg-gray-600 p-1 rounded-lg w-max border border-gray-500">
                            <button
                                type="button"
                                onClick={() => handleLocalConfigChange("mode", "builder")}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${!item.config.mode || item.config.mode === 'builder' ? 'bg-yellow-600 text-white shadow-sm font-medium' : 'text-gray-300 hover:text-white'}`}
                            >
                                Builder
                            </button>
                            <button
                                type="button"
                                onClick={() => handleLocalConfigChange("mode", "query")}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${item.config.mode === 'query' ? 'bg-yellow-600 text-white shadow-sm font-medium' : 'text-gray-300 hover:text-white'}`}
                            >
                                SpEL Query
                            </button>
                        </div>
                    </div>

                    {/* BUILDER UI - Mockoon Style */}
                    {(!item.config.mode || item.config.mode === "builder") && (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                {(item.config.rules || []).map((rule: LogicRule, idx: number) => (
                                    <div key={rule.id} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-gray-800 p-3 rounded-lg border border-gray-600 group shadow-sm">

                                        {/* 1. Target */}
                                        <select
                                            value={rule.target}
                                            onChange={(e) => updateRule(rule.id, 'target', e.target.value)}
                                            className="bg-gray-600 text-white text-xs p-2 rounded-lg border border-gray-500 w-24 focus:border-yellow-500 outline-none transition-colors"
                                        >
                                            <option value="body">Body</option>
                                            <option value="header">Header</option>
                                            <option value="query">Query</option>
                                        </select>

                                        {/* 2. Property */}
                                        <input
                                            type="text"
                                            value={rule.property}
                                            onChange={(e) => updateRule(rule.id, 'property', e.target.value)}
                                            placeholder="property (e.g. id)"
                                            className="bg-gray-600 text-white text-xs p-2 rounded-lg border border-gray-500 flex-1 min-w-[100px] outline-none focus:border-yellow-500 transition-colors placeholder-gray-400"
                                        />

                                        {/* 3. Invert Button */}
                                        <button
                                            type="button"
                                            onClick={() => updateRule(rule.id, 'invert', !rule.invert)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${rule.invert ? 'bg-red-900/50 border-red-500 text-red-400 font-bold' : 'bg-gray-600 border-gray-500 text-gray-400 hover:text-white hover:border-gray-400'}`}
                                            title="Invert Condition (!)"
                                        >
                                            !
                                        </button>

                                        {/* 4. Operator */}
                                        <select
                                            value={rule.operator}
                                            onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                                            className="bg-gray-600 text-white text-xs p-2 rounded-lg border border-gray-500 w-28 outline-none focus:border-yellow-500 transition-colors"
                                        >
                                            <option value="equals">equals ==</option>
                                            <option value="not_equals">not equals !=</option>
                                            <option value="contains">contains</option>
                                            <option value="matches">matches (regex)</option>
                                            <option value="exists">exists</option>
                                        </select>

                                        {/* 5. Value */}
                                        {rule.operator !== 'exists' && (
                                            <input
                                                type="text"
                                                value={rule.value}
                                                onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                                                placeholder="Value"
                                                className="bg-gray-600 text-white text-xs p-2 rounded-lg border border-gray-500 flex-1 min-w-[100px] outline-none focus:border-yellow-500 transition-colors placeholder-gray-400"
                                            />
                                        )}

                                        {/* 6. Delete */}
                                        <button
                                            type="button"
                                            onClick={() => removeRule(rule.id)}
                                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-full hover:bg-gray-700 transition-all opacity-60 group-hover:opacity-100"
                                            title="Remove Rule"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addRule}
                                className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-yellow-400 hover:border-yellow-500 hover:bg-gray-800 transition-all text-xs font-medium flex items-center justify-center gap-2"
                            >
                                <span className="text-lg font-bold">+</span> Add New Logic Rule
                            </button>

                            {/* Live Preview */}
                            <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Generated SpEL Preview</label>
                                <div className="p-2 bg-gray-900 rounded-lg border border-gray-800 text-[10px] text-green-400 font-mono break-all">
                                    {generateSpelFromRules(item.config.rules || []) || <span className="text-gray-600">// No rules defined</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QUERY MODE - Direct SpEL */}
                    {item.config.mode === "query" && (
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-xs font-medium text-gray-400">Raw SpEL Expression</label>
                            </div>
                            <textarea
                                value={item.config.spel || ""}
                                onChange={(e) => handleLocalConfigChange("spel", e.target.value)}
                                rows={6}
                                placeholder="#request.body.age > 18"
                                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600 text-white font-mono text-sm resize-none focus:border-yellow-500 outline-none transition-colors"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">
                                ℹ️ Define complex logic using standard <a href="#" className="text-blue-400 hover:underline">Spring Expression Language</a> syntax.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Styles for reuse */}
            <style jsx>{`
                .label-text { display: block; font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.25rem; font-weight: 500; }
                .input-field { width: 100%; padding: 0.5rem; border: 1px solid #4b5563; border-radius: 0.5rem; background-color: #374151; color: white; outline: none; transition: border-color 0.2s; }
                .input-field:focus { border-color: #60a5fa; }
            `}</style>
        </div>    );
};

export default InlineConfigForm;
