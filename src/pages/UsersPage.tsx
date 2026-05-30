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
  const [managerId, setManagerId] = useState('');
  const { toastMessage, showToast, clearToast } = useToast();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [roleSelections, setRoleSelections] = useState<Record<number, Role | ''>>({});
  const [managerSelections, setManagerSelections] = useState<Record<number, string>>({});
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canViewUsers = isAdmin || isManager;
  const managers = users.filter((teamUser) => teamUser.role === 'manager');
  const managerNameById = new Map(managers.map((manager) => [manager.id, manager.name]));

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
    if (!canViewUsers) return;
    queueMicrotask(() => {
      void loadUsers();
    });
  }, [canViewUsers, loadUsers]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!role) {
      setError('Please select a user role.');
      return;
    }

    setIsCreating(true);

    try {
      await createUser({
        name,
        email,
        password,
        role,
        managerId: managerId ? Number(managerId) : undefined,
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('');
      setManagerId('');
      showToast('User created successfully.');
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'User creation failed.'));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleSelect(teamUser: User, nextRole: Role | '') {
    if (!nextRole || nextRole === teamUser.role) {
      setRoleSelections((current) => ({ ...current, [teamUser.id]: '' }));
      return;
    }

    setRoleSelections((current) => ({ ...current, [teamUser.id]: nextRole }));
    await handleRoleChange(teamUser.id, nextRole);
    setRoleSelections((current) => ({ ...current, [teamUser.id]: '' }));
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

  async function handleManagerSelect(teamUser: User, nextManagerId: string) {
    if (!nextManagerId || Number(nextManagerId) === teamUser.managerId) {
      setManagerSelections((current) => ({ ...current, [teamUser.id]: '' }));
      return;
    }

    setManagerSelections((current) => ({ ...current, [teamUser.id]: nextManagerId }));
    setError('');
    setUpdatingUserId(teamUser.id);

    try {
      await updateUserRole(teamUser.id, teamUser.role, Number(nextManagerId));
      showToast('Manager assignment updated successfully.');
      await loadUsers();
    } catch {
      setError('Unable to update manager assignment.');
    } finally {
      setUpdatingUserId(null);
      setManagerSelections((current) => ({ ...current, [teamUser.id]: '' }));
    }
  }

  if (!canViewUsers) {
    return (
      <div className="border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold">Access not available</h2>
            <p className="mt-1 text-sm">Employees can view and update assigned tasks from the Tasks screen.</p>
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
          <p className="mt-1 text-sm text-zinc-500">{isAdmin ? 'Create users and update role-based access.' : 'View users assigned under your manager account.'}</p>
        </div>
        <button type="button" disabled={isLoading} onClick={loadUsers} className="inline-flex h-10 items-center justify-center gap-2 rounded border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? <Spinner label="Refreshing" /> : <><RefreshCw size={16} /> Refresh</>}
        </button>
      </div>

      <Toast message={toastMessage} onClose={clearToast} />
      {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {isAdmin ? (
        <section className="border border-zinc-200 bg-white p-4">
          <h3 className="font-semibold">Create User</h3>
          <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(150px,1fr)_minmax(190px,1fr)_160px_170px_170px_auto]">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="h-10 min-w-0 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-10 min-w-0 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="h-10 min-w-0 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required minLength={8} />
            <select value={role} onChange={(event) => { const nextRole = event.target.value as Role | ''; setRole(nextRole); if (nextRole !== 'employee') setManagerId(''); }} className={`h-10 min-w-0 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950 ${role ? 'text-zinc-900' : 'text-zinc-400'}`} required>
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            <select value={managerId} onChange={(event) => setManagerId(event.target.value)} disabled={role !== 'employee'} className={`h-10 min-w-0 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-70 ${managerId ? 'text-zinc-900' : 'text-zinc-400'}`}>
              <option value="">Select manager</option>
              {managers.length ? managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>) : <option value="" disabled>No managers available</option>}
            </select>
            <button disabled={isCreating} className="inline-flex h-10 min-w-[104px] items-center justify-center gap-2 rounded bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 xl:col-span-1">
              {isCreating ? <Spinner label="Creating" /> : <><Plus size={16} /> Create</>}
            </button>
          </form>
        </section>
      ) : null}

      <section className="border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          {isAdmin ? (
            <table className="min-w-[1040px] w-full table-fixed divide-y divide-zinc-200 text-sm">
              <colgroup><col className="w-[20%]" /><col className="w-[26%]" /><col className="w-[14%]" /><col className="w-[16%]" /><col className="w-[12%]" /><col className="w-[12%]" /></colgroup>
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Current Role</th><th className="px-4 py-3">Manager</th><th className="px-4 py-3">Change Role</th><th className="px-4 py-3">Assign Manager</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? <TableLoading colSpan={6} label="Loading users" /> : null}
                {!isLoading && users.map((teamUser) => (
                  <tr key={teamUser.id}>
                    <td className="px-4 py-3"><p className="truncate font-medium text-zinc-900" title={teamUser.name}>{teamUser.name}</p></td>
                    <td className="px-4 py-3"><p className="truncate text-zinc-600" title={teamUser.email}>{teamUser.email}</p></td>
                    <td className="px-4 py-3"><Badge value={teamUser.role} /></td>
                    <td className="px-4 py-3 text-zinc-600">{teamUser.managerId ? managerNameById.get(teamUser.managerId) ?? `User #${teamUser.managerId}` : '-'}</td>
                    <td className="px-4 py-3"><select disabled={updatingUserId === teamUser.id} value={roleSelections[teamUser.id] ?? ''} onChange={(event) => void handleRoleSelect(teamUser, event.target.value as Role | '')} className={`h-9 w-full rounded border border-zinc-200 px-2 text-sm outline-none focus:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 ${roleSelections[teamUser.id] ? 'text-zinc-900' : 'text-zinc-400'}`}><option value="">Select role</option><option value="admin">Admin</option><option value="manager">Manager</option><option value="employee">Employee</option></select></td>
                    <td className="px-4 py-3"><select disabled={updatingUserId === teamUser.id || teamUser.role !== 'employee'} value={managerSelections[teamUser.id] ?? ''} onChange={(event) => void handleManagerSelect(teamUser, event.target.value)} className={`h-9 w-full rounded border border-zinc-200 px-2 text-sm outline-none focus:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 ${managerSelections[teamUser.id] ? 'text-zinc-900' : 'text-zinc-400'}`}><option value="">Select manager</option>{managers.filter((manager) => manager.id !== teamUser.id).map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}</select></td>
                  </tr>
                ))}
                {!isLoading && !users.length ? <tr><td className="px-4 py-8 text-center text-zinc-500" colSpan={6}>No users found.</td></tr> : null}
              </tbody>
            </table>
          ) : (
            <table className="min-w-[640px] w-full table-fixed divide-y divide-zinc-200 text-sm">
              <colgroup><col className="w-[34%]" /><col className="w-[42%]" /><col className="w-[24%]" /></colgroup>
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Current Role</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {isLoading ? <TableLoading colSpan={3} label="Loading users" /> : null}
                {!isLoading && users.map((teamUser) => (
                  <tr key={teamUser.id}>
                    <td className="px-4 py-3"><p className="truncate font-medium text-zinc-900" title={teamUser.name}>{teamUser.name}</p></td>
                    <td className="px-4 py-3"><p className="truncate text-zinc-600" title={teamUser.email}>{teamUser.email}</p></td>
                    <td className="px-4 py-3"><Badge value={teamUser.role} /></td>
                  </tr>
                ))}
                {!isLoading && !users.length ? <tr><td className="px-4 py-8 text-center text-zinc-500" colSpan={3}>No users found.</td></tr> : null}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
