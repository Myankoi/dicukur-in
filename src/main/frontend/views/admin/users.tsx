import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  Key,
  Shield,
  X,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react';
import { AdminUserEndpoint } from '../../generated/endpoints.js';
import type UserResponse from '../../generated/com/dicukur/app/user/dto/UserResponse.js';
import type AdminCreateUserRequest from '../../generated/com/dicukur/app/user/dto/AdminCreateUserRequest.js';

export default function AdminUsersPage() {
  const [activeRoleTab, setActiveRoleTab] = useState<'Customer' | 'Owner'>('Customer');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive' | 'suspended'>('ALL');

  // Modal State: Create
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AdminCreateUserRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleName: 'Customer',
    status: 'active',
    notes: '',
  });

  // Modal State: Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    notes: '',
  });

  // Modal State: Delete / Suspend
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminUserEndpoint.getUsersByRole(activeRoleTab);
      setUsers((data || []).filter((u): u is UserResponse => u !== undefined));
    } catch (err: any) {
      setError(err?.message || `Gagal memuat daftar user ${activeRoleTab}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeRoleTab]);

  // Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    try {
      const req: AdminCreateUserRequest = {
        ...createForm,
        roleName: activeRoleTab,
      };
      await AdminUserEndpoint.createUser(req);
      setSuccessMsg(`Berhasil menambah user baru sebagai ${activeRoleTab}!`);
      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleName: activeRoleTab,
        status: 'active',
        notes: '',
      });
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan user.');
    } finally {
      setProcessing(false);
    }
  };

  // Open Edit Modal
  const openEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      status: user.status || 'active',
      notes: user.notes || '',
    });
    setEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || selectedUser.id === undefined) return;
    setProcessing(true);
    setError(null);
    try {
      await AdminUserEndpoint.updateUser(selectedUser.id, editForm);
      setSuccessMsg(`Data user "${editForm.name}" berhasil diperbarui!`);
      setEditModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui data user.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Delete / Suspend
  const handleDeleteSubmit = async () => {
    if (!selectedUser || selectedUser.id === undefined) return;
    setProcessing(true);
    setError(null);
    try {
      await AdminUserEndpoint.deleteUser(selectedUser.id);
      setSuccessMsg(`User "${selectedUser.name}" berhasil ditangguhkan/nonaktifkan.`);
      setDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus user.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <UserCheck size={12} />
            Aktif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            <Clock size={12} />
            Nonaktif
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
            <UserX size={12} />
            Ditangguhkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Manajemen User Sistem
          </h1>
          <p className="text-sm text-slate-500">
            Kelola data akun Pelanggan (Customer) dan Pemilik Usaha (Owner Barbershop) secara lengkap (CRUD).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCreateForm({
              name: '',
              email: '',
              phone: '',
              password: '',
              roleName: activeRoleTab,
              status: 'active',
              notes: '',
            });
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Tambah {activeRoleTab} Baru
        </button>
      </div>

      {/* Role Selection Tabs (Customer vs Owner) */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveRoleTab('Customer')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeRoleTab === 'Customer'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User size={18} />
          Customer (Pelanggan)
        </button>
        <button
          type="button"
          onClick={() => setActiveRoleTab('Owner')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeRoleTab === 'Owner'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 size={18} />
          Owner (Pemilik Barbershop)
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari nama, email, atau no HP ${activeRoleTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(
              [
                { id: 'ALL', label: 'Semua' },
                { id: 'active', label: 'Aktif' },
                { id: 'inactive', label: 'Nonaktif' },
                { id: 'suspended', label: 'Ditangguhkan' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <div className="size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium">Memuat data user {activeRoleTab}...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500 shadow-xs">
          <User size={40} className="mx-auto mb-3 text-slate-400" />
          <p className="text-base font-semibold text-slate-700">Tidak Ada Data {activeRoleTab}</p>
          <p className="text-xs text-slate-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Tidak ada data user yang sesuai dengan kriteria pencarian.'
              : `Belum ada user ber-role ${activeRoleTab} yang terdaftar.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email & No HP</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 font-medium text-slate-900 flex items-center gap-2.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      {u.notes && <p className="text-[11px] text-slate-500 truncate max-w-xs">{u.notes}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <Mail size={13} className="text-slate-400" />
                      <span className="font-semibold">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone size={13} className="text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 border border-slate-200">
                      {u.roleName}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">{getStatusBadge(u.status)}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-medium">
                    {u.createdAt ? u.createdAt.split('T')[0] : '-'}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 size={13} />
                      Nonaktifkan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREATE USER */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Plus size={18} className="text-brand-400" />
                  Tambah Akun {activeRoleTab} Baru
                </h3>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Masukkan nama lengkap user"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Nomor Telepon / WA</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="08123456789"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Password * (Min 6 karakter)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Status Akun</label>
                    <select
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Catatan Admin (Opsional)</label>
                  <textarea
                    rows={2}
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Catatan internal admin..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    disabled={processing}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 font-semibold text-zinc-400 hover:text-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 font-bold text-zinc-950 hover:bg-brand-400 shadow-md shadow-brand-500/20 transition disabled:opacity-50"
                  >
                    {processing ? 'Menyimpan...' : 'Simpan User Baru'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDIT USER */}
      <AnimatePresence>
        {editModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Edit2 size={18} className="text-brand-400" />
                  Edit Akun {selectedUser.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Nomor Telepon / WA</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">
                      Password Baru (Kosongkan jika tidak ubah)
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Ubah password..."
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Status Akun</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                      <option value="suspended">Ditangguhkan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Catatan Admin</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    disabled={processing}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 font-semibold text-zinc-400 hover:text-zinc-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 font-bold text-zinc-950 hover:bg-brand-400 shadow-md shadow-brand-500/20 transition disabled:opacity-50"
                  >
                    {processing ? 'Menyimpan...' : 'Perbarui Data User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DELETE / SUSPEND */}
      <AnimatePresence>
        {deleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-zinc-900 p-6 shadow-2xl text-zinc-100"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <Trash2 size={24} />
                <h3 className="text-lg font-bold text-zinc-100">Nonaktifkan / Tangguhkan User</h3>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Apakah Anda yakin ingin menonaktifkan/menangguhkan akun <strong className="text-zinc-200">{selectedUser.name}</strong> ({selectedUser.email})? User ini tidak akan dapat login sampai diaktifkan kembali.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={processing}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={processing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 transition disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Ya, Nonaktifkan User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
