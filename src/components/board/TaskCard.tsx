import { Calendar, CheckSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { PriorityBadge } from '../ui/PriorityBadge';

export interface TaskCardData {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  assignees: { id: string; full_name: string }[];
  subtask_count: number;
  subtask_done: number;
}

export function TaskCard({ task, onClick }: { task: TaskCardData; onClick?: () => void }) {
  const overdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{task.title}</span>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        {task.due_date && (
          <span className={`inline-flex items-center gap-1 ${overdue ? 'text-red-600' : ''}`}>
            <Calendar size={12} />
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
        {task.subtask_count > 0 && (
          <span className="inline-flex items-center gap-1">
            <CheckSquare size={12} />
            {task.subtask_done}/{task.subtask_count}
          </span>
        )}
      </div>

      {task.assignees.length > 0 && (
        <div className="mt-2 flex -space-x-2">
          {task.assignees.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-xs font-semibold text-primary-700"
              title={a.full_name}
            >
              {a.full_name.charAt(0)}
            </div>
          ))}
        </div>
      )}
    </button>
  );
}