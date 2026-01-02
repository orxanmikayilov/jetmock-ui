'use client';

import React from "react";

interface Props {
    filters: any;
    setFilters: any;
}

const FilterSortHeader: React.FC<Props> = ({ filters, setFilters }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700 mt-6 space-y-4">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => setFilters((p: any) => ({ ...p, query: e.target.value }))}
                    placeholder="Search by service or group name..."
                    className="p-2 flex-grow border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400"
                />

                <select
                    value={filters.statusFilter}
                    onChange={(e) =>
                        setFilters((p: any) => ({
                            ...p,
                            statusFilter: e.target.value,
                        }))
                    }
                    className="p-2 border border-gray-600 rounded-md bg-gray-700 text-white w-full md:w-40"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400 pt-2 border-t border-gray-700">
                <span className="font-medium">Sort By:</span>

                {["date", "count", "name"].map((field) => (
                    <button
                        key={field}
                        onClick={() =>
                            setFilters((p: any) => ({
                                ...p,
                                sortBy: field,
                            }))
                        }
                        className={`transition-colors ${
                            filters.sortBy === field ? "text-blue-400 font-bold" : "hover:text-gray-200"
                        }`}
                    >
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                    </button>
                ))}

                <button
                    onClick={() =>
                        setFilters((p: any) => ({
                            ...p,
                            sortOrder: p.sortOrder === "asc" ? "desc" : "asc",
                        }))
                    }
                    className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                    {filters.sortOrder === "asc" ? "⬆️ ASC" : "⬇️ DESC"}
                </button>
            </div>
        </div>
    );
};

export default React.memo(FilterSortHeader);
