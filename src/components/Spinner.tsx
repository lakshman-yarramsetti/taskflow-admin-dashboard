import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="animate-spin" size={16} />
      <span>{label}</span>
    </span>
  );
}

export function TableLoading({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td className="px-4 py-8 text-center text-zinc-500" colSpan={colSpan}>
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          {label}
        </span>
      </td>
    </tr>
  );
}
