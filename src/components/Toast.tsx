import { CheckCircle2, X } from 'lucide-react';

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;

  return (
    <div className="fixed left-4 right-4 top-4 z-50 flex sm:left-auto sm:max-w-sm items-center gap-3 border border-emerald-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-lg">
      <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
      <p className="flex-1">{message}</p>
      <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950" title="Close toast">
        <X size={16} />
      </button>
    </div>
  );
}


