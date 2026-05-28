import type { LucideIcon } from 'lucide-react';

export function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-950 text-white">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
