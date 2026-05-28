import clsx from 'clsx';
import type { Role, TaskStatus } from '../types/api';

const styles: Record<Role | TaskStatus, string> = {
  admin: 'bg-red-50 text-red-700 ring-red-600/20',
  manager: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  employee: 'bg-zinc-100 text-zinc-700 ring-zinc-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  in_progress: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export function Badge({ value }: { value: Role | TaskStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex min-w-24 justify-center rounded px-2 py-1 text-xs font-semibold capitalize ring-1 ring-inset',
        styles[value],
      )}
    >
      {value.replace('_', ' ')}
    </span>
  );
}
