"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import UserRow from './UserRow';
import api from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastSeen: string;
    createdAt: string;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
}

const EMPTY_FORM: FormData = { name: '', email: '', password: '', role: 'user', status: 'active' };

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async (query: string, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setSearching(true);
        setFetchError('');
        try {
            const { data } = await api.get('/users', { params: { search: query, limit: 50 } });
            setUsers(data.users || []);
        } catch (err: any) {
            setFetchError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const isInitial = search === '' && users.length === 0;
        const timer = setTimeout(() => fetchUsers(search, isInitial), 300);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, fetchUsers]);

    const handleAdd = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.post('/users', formData);
            setShowAddModal(false);
            setFormData(EMPTY_FORM);
            fetchUsers(search, false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!editUser) return;
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/users/${editUser._id}`, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
            });
            setEditUser(null);
            fetchUsers(search, false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteUserId) return;
        try {
            await api.delete(`/users/${deleteUserId}`);
            setDeleteUserId(null);
            fetchUsers(search, false);
        } catch {
            // silent
        }
    };

    const openEdit = (user: User) => {
        setEditUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role, status: user.status });
        setError('');
    };

    return (
        <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-[#2A3430] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searching ? 'text-emerald-500' : 'text-gray-500'}`} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0D1210] border border-[#2A3430] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                </div>
                <button
                    onClick={() => { setShowAddModal(true); setFormData(EMPTY_FORM); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all text-sm font-medium"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* List */}
            <div className={`p-6 space-y-4 transition-opacity ${searching ? 'opacity-60' : 'opacity-100'}`}>
                {fetchError ? (
                    <div className="text-center text-rose-400 py-8 text-sm">{fetchError}</div>
                ) : loading ? (
                    <div className="text-center text-gray-500 py-8 text-sm">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 text-sm">
                        {search ? `No users found for "${search}"` : 'No users found'}
                    </div>
                ) : (
                    users.map((user) => (
                        <UserRow
                            key={user._id}
                            user={user}
                            onEdit={() => openEdit(user)}
                            onDelete={() => setDeleteUserId(user._id)}
                        />
                    ))
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <Modal title="Add User" onClose={() => setShowAddModal(false)} onSubmit={handleAdd} submitting={submitting} error={error} submitLabel="Create User">
                    <UserFormFields data={formData} onChange={setFormData} showPassword />
                </Modal>
            )}

            {/* Edit User Modal */}
            {editUser && (
                <Modal title="Edit User" onClose={() => setEditUser(null)} onSubmit={handleEdit} submitting={submitting} error={error} submitLabel="Save Changes">
                    <UserFormFields data={formData} onChange={setFormData} showPassword={false} />
                </Modal>
            )}

            {/* Delete Confirmation */}
            {deleteUserId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-white font-semibold mb-2">Delete User</h3>
                        <p className="text-gray-400 text-sm mb-6">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteUserId(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-all">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface ModalProps {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    submitting: boolean;
    error: string;
    submitLabel: string;
    children: React.ReactNode;
}

const Modal = ({ title, onClose, onSubmit, submitting, error, submitLabel, children }: ModalProps) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {children}
            {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-all">Cancel</button>
                <button onClick={onSubmit} disabled={submitting} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50">
                    {submitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </div>
    </div>
);

interface FormFieldsProps {
    data: FormData;
    onChange: (d: FormData) => void;
    showPassword: boolean;
}

const UserFormFields = ({ data, onChange, showPassword }: FormFieldsProps) => {
    const inputClass = "w-full bg-[#0D1210] border border-[#2A3430] rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input type="text" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={data.email} onChange={(e) => onChange({ ...data, email: e.target.value })} className={inputClass} />
            </div>
            {showPassword && (
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Password</label>
                    <input type="password" value={data.password} onChange={(e) => onChange({ ...data, password: e.target.value })} className={inputClass} />
                </div>
            )}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select value={data.role} onChange={(e) => onChange({ ...data, role: e.target.value })} className={inputClass}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select value={data.status} onChange={(e) => onChange({ ...data, status: e.target.value })} className={inputClass}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                </select>
            </div>
        </div>
    );
};

export default UserList;
