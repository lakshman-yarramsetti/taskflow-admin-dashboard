import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, ListTodo, Users } from 'lucide-react';
import { fetchTasks, fetchUsers } from '../api/taskflow';
import { Badge } from '../components/Badge';
import { Spinner, TableLoading } from '../components/Spinner';
import { StatTile } from '../components/StatTile';
import { useAuth } from '../auth/useAuth';
import type { Task, User } from '../types/api';

export function OverviewPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadOverview() {
      setError('');
      setIsLoading(true);
      try {
        const taskResponse = await fetchTasks({ limit: 50 });
        setTasks(taskResponse.data);

        if (user?.role === 'admin') {
          setUsers(await fetchUsers());
        }
      } catch {
        setError('Unable to load overview. Check API server and your role permissions.');
      } finally {
        setIsLoading(false);
      }
    }

    queueMicrotask(() => {
      void loadOverview();
    });
  }, [user?.role]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === 'pending').length,
      completed: tasks.filter((task) => task.status === 'completed').length,
      users: users.length,
    };
  }, [tasks, users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">Task status and team activity from the RBAC API.</p>
        </div>
        {isLoading ? <div className="text-sm text-zinc-500"><Spinner label="Loading overview" /></div> : null}
      </div>

      {error ? <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={ListTodo} label="Visible tasks" value={stats.total} />
        <StatTile icon={Clock3} label="Pending" value={stats.pending} />
        <StatTile icon={CheckCircle2} label="Completed" value={stats.completed} />
        <StatTile icon={Users} label="Users" value={user?.role === 'admin' ? stats.users : 'Admin only'} />
      </section>

      <section className="border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h3 className="font-semibold">Recent Tasks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? <TableLoading colSpan={3} label="Loading recent tasks" /> : null}
              {!isLoading && tasks.slice(0, 6).map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900">{task.title}</td>
                  <td className="px-4 py-3"><Badge value={task.status} /></td>
                  <td className="px-4 py-3 text-zinc-600">User #{task.assignedToId}</td>
                </tr>
              ))}
              {!isLoading && !tasks.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-zinc-500" colSpan={3}>No tasks found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

