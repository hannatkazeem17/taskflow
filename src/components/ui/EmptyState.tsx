import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-slate-300">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}