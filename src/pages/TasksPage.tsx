import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { createTask, fetchTasks, fetchUsers, updateTaskStatus } from '../api/taskflow';
import { useAuth } from '../auth/useAuth';
import { Badge } from '../components/Badge';
import { Spinner, TableLoading } from '../components/Spinner';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import type { Task, TaskStatus, User } from '../types/api';

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const { toastMessage, showToast, clearToast } = useToast();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const loadTasks = useCallback(
    async (filters: { search?: string; status?: TaskStatus | '' } = {}) => {
      setError('');
      setIsLoading(true);
      try {
        const response = await fetchTasks({
          search: filters.search,
          status: filters.status,
          limit: 25,
        });
        setTasks(response.data);
      } catch {
        setError('Unable to load tasks. Check API server and token.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadTasks();
    });
  }, [loadTasks]);

  useEffect(() => {
    if (!canCreate) return;

    queueMicrotask(async () => {
      try {
        const result = await fetchUsers();
        setUsers(result);
        setAssignedToId('');
      } catch {
        setUsers([]);
      }
    });
  }, [canCreate]);

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      await createTask({
        title,
        description,
        assignedToId: Number(assignedToId),
      });
      setTitle('');
      setDescription('');
      showToast('Task created successfully.');
      await loadTasks({ search, status });
    } catch (err) {
      const apiMessage = err instanceof AxiosError ? err.response?.data?.message : undefined;
      setError(Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage ?? 'Task creation failed.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(taskId: number, nextStatus: TaskStatus) {
    setError('');
    setUpdatingTaskId(taskId);

    try {
      await updateTaskStatus(taskId, nextStatus);
      showToast('Task status updated successfully.');
      await loadTasks({ search, status });
    } catch {
      setError('Unable to update this task status.');
    } finally {
      setUpdatingTaskId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">Tasks</h2>
          <p className="mt-1 text-sm text-zinc-500">Create, filter, assign, and update task status.</p>
        </div>
        <button type="button" disabled={isLoading} onClick={() => loadTasks({ search, status })} className="inline-flex h-10 items-center justify-center gap-2 rounded border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60">
          {isLoading ? <Spinner label="Refreshing" /> : <><RefreshCw size={16} /> Refresh</>}
        </button>
      </div>

      <Toast message={toastMessage} onClose={clearToast} />
      {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {canCreate ? (
        <section className="border border-zinc-200 bg-white p-4">
          <h3 className="font-semibold">Create Task</h3>
          <form onSubmit={handleCreateTask} className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_220px_auto]">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title, e.g. Prepare sprint report" className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required />
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description, e.g. Add notes or acceptance criteria" className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" />
            <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)} className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" required>
              {users.map((teamUser) => <option key={teamUser.id} value={teamUser.id}>{teamUser.name}</option>)}
            </select>
            <button disabled={isCreating || !assignedToId} className="inline-flex h-10 items-center justify-center gap-2 rounded bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isCreating ? <Spinner label="Creating" /> : <><Plus size={16} /> Create</>}
            </button>
          </form>
        </section>
      ) : null}

      <section className="border border-zinc-200 bg-white">
        <div className="grid gap-3 border-b border-zinc-200 p-4 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by task title" className="h-10 w-full rounded border border-zinc-200 pl-9 pr-3 text-sm outline-none focus:border-zinc-950" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | '')} className="h-10 rounded border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950">
            <option value="">Select status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <button disabled={isLoading} onClick={() => loadTasks({ search, status })} className="h-10 rounded bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Applying...' : 'Apply'}</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Update</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? <TableLoading colSpan={4} label="Loading tasks" /> : null}
              {!isLoading && tasks.map((task) => (
                <tr key={task.id}>
                  <td className="max-w-md px-4 py-3"><p className="font-medium text-zinc-900">{task.title}</p><p className="mt-1 text-zinc-500">{task.description || 'No description'}</p></td>
                  <td className="px-4 py-3"><Badge value={task.status} /></td>
                  <td className="px-4 py-3 text-zinc-600">User #{task.assignedToId}</td>
                  <td className="px-4 py-3"><select disabled={updatingTaskId === task.id} value={task.status} onChange={(event) => handleStatusChange(task.id, event.target.value as TaskStatus)} className="h-9 rounded border border-zinc-200 px-2 text-sm outline-none focus:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></td>
                </tr>
              ))}
              {!isLoading && !tasks.length ? <tr><td className="px-4 py-8 text-center text-zinc-500" colSpan={4}>No tasks found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}





