import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isPast, isToday, isTomorrow, differenceInHours } from 'date-fns';
import { Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../api/client';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface MyTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string | null;
  subtask_count: number;
  subtask_done: number;
}

interface TasksResponse {
  items: MyTask[];
}

function isAtRisk(task: MyTask): boolean {
  if (!task.due_date || task.status === 'done') return false;
  const hours = differenceInHours(new Date(task.due_date), new Date());
  return hours >= 0 && hours <= 48 && task.status === 'todo';
}

const priorityBar: Record<MyTask['priority'], string> = {
  low: 'bg-primary-400',
  medium: 'bg-amber',
  high: 'bg-coral',
  urgent: 'bg-coral',
};

function TaskRow({ task, onComplete }: { task: MyTask; onComplete: (id: string) => void }) {
  const overdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  const dueLabel = task.due_date
    ? isToday(new Date(task.due_date))
      ? 'Due today'
      : isTomorrow(new Date(task.due_date))
        ? 'Due tomorrow'
        : `Due ${format(new Date(task.due_date), 'EEE d MMM')}`
    : '';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className={`h-10 w-1.5 shrink-0 rounded-full ${priorityBar[task.priority]}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
        <p className={`mt-0.5 text-xs ${overdue ? 'text-coral' : 'text-slate-500'}`}>
          {dueLabel}
          {task.subtask_count > 0 && ` · ${task.subtask_done}/${task.subtask_count} subtasks`}
        </p>
      </div>
      <button
        onClick={() => onComplete(task.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-slate-400 hover:border-primary-400 hover:text-primary-600"
        aria-label="Mark as done"
      >
        <Check size={16} />
      </button>
    </div>
  );
}

export function MyTasksPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => apiRequest<TasksResponse>('/tasks/me'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task completed');
    },
    onError: () => toast.error('Could not complete task'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (isError) return <div className="text-sm text-red-600">Could not load your tasks.</div>;

  const tasks = data?.items ?? [];
  const atRisk = tasks.filter(isAtRisk);
  const today = tasks.filter((t) => !isAtRisk(t) && t.status !== 'done' && t.due_date && isToday(new Date(t.due_date)));
  const later = tasks.filter((t) => !isAtRisk(t) && t.status !== 'done' && !today.includes(t));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Today</h1>
      <p className="mb-6 text-sm text-slate-500">
        {format(new Date(), 'EEEE d MMMM')} · {atRisk.length} at risk · {today.length} due today
      </p>

      {tasks.length === 0 && (
        <EmptyState
          title="Nothing on your plate"
          description="Tasks assigned to you will appear here."
        />
      )}

      {/* At-risk section — visually distinct, at the top */}
      {atRisk.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-coral">
            <AlertTriangle size={16} /> At risk
          </h2>
          <div className="rounded-xl border border-coral/30 bg-coral/5 p-3">
            <div className="flex flex-col gap-2">
              {atRisk.map((t) => (
                <TaskRow key={t.id} task={t} onComplete={completeMutation.mutate} />
              ))}
            </div>
          </div>
        </section>
      )}

      {today.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Due today</h2>
          <div className="flex flex-col gap-2">
            {today.map((t) => (
              <TaskRow key={t.id} task={t} onComplete={completeMutation.mutate} />
            ))}
          </div>
        </section>
      )}

      {later.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Later</h2>
          <div className="flex flex-col gap-2">
            {later.map((t) => (
              <TaskRow key={t.id} task={t} onComplete={completeMutation.mutate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}