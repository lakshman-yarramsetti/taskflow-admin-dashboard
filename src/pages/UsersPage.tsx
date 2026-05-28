import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { createUser, fetchUsers, updateUserRole } from '../api/taskflow';
import { useAuth } from '../auth/useAuth';
import { Badge } from '../components/Badge';
import { Spinner, TableLoading } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import type { Role, User } from '../types/api';

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const { toastMessage, showToast, clearToast } = useToast();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const isAdmin = user?.role === 'admin';

  function getErrorMessage(err: unknown, fallback: string) {
    const apiMessage = err instanceof AxiosError ? err.response?.data?.message : undefined;
    return Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage ?? fallback;
  }

  const loadUsers = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load users.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    queueMicrotask(() => {
      void loadUsers();
    });
  }, [isAdmin, loadUsers]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a user role.');
      return;
    }

    setIsCreating(true);

    try {
      await createUser({ name, email, password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      showToast('User created successfully.');
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'User creation failed.'));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(userId: number, nextRole: Role) {
    setError('');
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, nextRole);
      showToast('User role updated successfully.');
      await loadUsers();
    } catch {
      setError('Unable to update user role.');
    } finally {
      setUpdatingUserId(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold">Admin access required</h2>
            <p className="mt-1 text-sm">Only admin users can view and manage user roles.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">Users</h2>
          <p className="mt-1 text-sm text-zinc-500">Create users and update role-based access.</p>
        </div>
        <button type="button" disabled={isLoading} onClick={loadUsers} className="inline-flex h-10 items-center justify-center gap-2 rounded border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? <Spinner label="Refreshing" /> : <><RefreshCw size={16} /> Refresh</>}
        </button>
      </div>

      <Toast message={toastMessage} onClose={clearToast} />
      {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className="border border-zinc-200 bg-white p-4">
        <h3 className="font-semibold">Create User</h3>
        <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_180px_180px_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required />
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (min 8 characters)" className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required minLength={8} />
          <select value={role} onChange={(event) => setRole(event.target.value as Role | '')} className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required>
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <button disabled={isCreating} className="inline-flex h-10 items-center justify-center gap-2 rounded bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isCreating ? <Spinner label="Creating" /> : <><Plus size={16} /> Create</>}
          </button>
        </form>
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Current Role</th><th className="px-4 py-3">Change Role</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? <TableLoading colSpan={4} label="Loading users" /> : null}
              {!isLoading && users.map((teamUser) => (
                <tr key={teamUser.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900">{teamUser.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{teamUser.email}</td>
                  <td className="px-4 py-3"><Badge value={teamUser.role} /></td>
                  <td className="px-4 py-3"><select disabled={updatingUserId === teamUser.id} value={teamUser.role} onChange={(event) => handleRoleChange(teamUser.id, event.target.value as Role)} className="h-9 rounded border border-zinc-200 px-2 text-sm outline-none focus:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"><option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option></select></td>
                </tr>
              ))}
              {!isLoading && !users.length ? <tr><td className="px-4 py-8 text-center text-zinc-500" colSpan={4}>No users found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}



