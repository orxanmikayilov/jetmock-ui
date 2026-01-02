// components/GroupListClient.tsx

'use client';

import React, {useEffect, useMemo, useState} from 'react';
import CreateGroupForm from './CreateGroupForm';
import GroupList from './GroupList';
import ConfirmModal from './ConfirmModal';
import toast from "react-hot-toast";
import FilterSortHeader from "./FilterSortHeader";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface Group {
    id: string;
    name: string;
    fromService: string;
    toService: string;
    isActive: boolean;
    mockCount: number;
    createdAt: string;
}

interface FilterState {
    query: string;
    sortBy: 'name' | 'count' | 'date';
    sortOrder: 'asc' | 'desc';
    statusFilter: 'all' | 'active' | 'inactive';
}

const GroupListClient: React.FC = () => {

    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        query: '',
        sortBy: 'date',
        sortOrder: 'desc',
        statusFilter: 'all',
    });

    const openDeleteModal = (id: string) => {
        setDeleteId(id);
        setModalOpen(true);
    };

    const cancelDelete = () => {
        setModalOpen(false);
        setDeleteId(null);
    };

    // ---------------------------------------------------
    // 🔥 Fetch Groups on Mount
    // ---------------------------------------------------
    const fetchGroups = async () => {
        try {
            const res = await fetch(`${BASE_URL}/v1/groups`, {
                cache: "no-store"
            });

            const data = await res.json();

            // Generate fromService & toService from "name"
            const transformed = data.map((g: any) => {
                const [fromService, toService] = g.name.split("_to_");

                return {
                    ...g,
                    fromService: fromService || "",
                    toService: toService || "",
                };
            });

            setGroups(transformed);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load groups");
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);


    // ---------------------------------------------------
    // Create Group
    // ---------------------------------------------------
    const handleCreateGroup = async (fromService: string, toService: string) => {
        setIsLoading(true);

        try {
            const groupName =
                `${fromService.toLowerCase().replace(/ /g, '_')}` +
                `_to_` +
                `${toService.toLowerCase().replace(/ /g, '_')}`;

            const response = await fetch(`${BASE_URL}/v1/groups`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: groupName}),
            });

            if (!response.ok) {
                toast.error("Failed to create group ❌");
                return;
            }

            toast.success("Group created successfully 🎉");
            await fetchGroups();

        } catch (error) {
            console.error(error);
            toast.error("Unexpected error ⚠️");
        } finally {
            setIsLoading(false);
        }
    };


    // ---------------------------------------------------
    // Toggle Status
    // ---------------------------------------------------
    const handleToggleStatus = async (id: string, newStatus: boolean) => {
        try {
            const res = await fetch(`${BASE_URL}/v1/groups/${id}/status`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({isActive: newStatus}),
            });

            if (!res.ok) {
                toast.error("Failed to update status ❌");
                return;
            }

            toast.success("Status updated ✔️");
            await fetchGroups();

        } catch (err) {
            console.error(err);
            toast.error("An error occurred ⚠️");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`${BASE_URL}/v1/groups/${deleteId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                toast.error("Failed to delete group ❌");
                return;
            }

            toast.success("Group deleted successfully 🗑️");
            await fetchGroups();

        } catch (err) {
            console.error(err);
            toast.error("An error occurred ⚠️");
        }

        setModalOpen(false);
        setDeleteId(null);
    };


    // ---------------------------------------------------
    // Filtering + Sorting
    // ---------------------------------------------------
    const sortedAndFilteredGroups = useMemo(() => {
        const filtered = groups.filter(group => {
            if (filters.statusFilter === 'active' && !group.isActive) return false;
            if (filters.statusFilter === 'inactive' && group.isActive) return false;

            const q = filters.query.toLowerCase();
            return (
                group.name.toLowerCase().includes(q) ||
                group.fromService.toLowerCase().includes(q) ||
                group.toService.toLowerCase().includes(q)
            );
        });

        return filtered.sort((a, b) => {
            let comp = 0;

            if (filters.sortBy === 'count')
                comp = a.mockCount - b.mockCount;
            else if (filters.sortBy === 'date')
                comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            else
                comp = a.name.localeCompare(b.name);

            return filters.sortOrder === 'asc' ? comp : -comp;
        });
    }, [groups, filters]);


    return (
        <>
            <CreateGroupForm onCreateGroup={handleCreateGroup} isLoading={isLoading}/>

            {isLoading && <p className="text-blue-400 my-4">Processing data...</p>}

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">
                Existing Mock Groups ({sortedAndFilteredGroups.length})
            </h2>

            <FilterSortHeader filters={filters} setFilters={setFilters}/>

            <GroupList
                groups={sortedAndFilteredGroups}
                onToggleStatus={handleToggleStatus}
                onDeleteGroup={openDeleteModal}
            />

            <ConfirmModal
                open={isModalOpen}
                title="Delete this group?"
                message="If you delete this group, all associated mock flows may also be removed."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
};

export default GroupListClient;
