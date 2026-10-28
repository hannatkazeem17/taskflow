import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../api/client';
import { Skeleton } from '../components/ui/Skeleton';
import { TaskCard, type TaskCardData } from '../components/board/TaskCard';

interface ColumnData {
  id: string;
  name: string;
  is_done_column: boolean;
  tasks: TaskCardData[];
}

interface BoardResponse {
  project: { id: string; name: string; workspace_id: string };
  columns: ColumnData[];
}

function QuickAdd({ columnId, projectId }: { columnId: string; projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTitle: string) =>
      apiRequest(`/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, column_id: columnId, project_id: projectId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      setTitle('');
      setIsOpen(false);
      toast.success('Task added');
    },
    onError: () => toast.error('Could not add task'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) mutation.mutate(title.trim());
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-200"
      >
        <Plus size={16} /> Add a task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-primary-500"
        onBlur={() => { if (!title.trim()) setIsOpen(false); }}
      />
      <div className="mt-1 flex gap-1">
        <button type="submit" className="rounded bg-primary-600 px-2 py-1 text-xs text-white hover:bg-primary-700">
          Add
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['board', projectId],
    queryFn: () => apiRequest<BoardResponse>(`/projects/${projectId}/board`),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-72" />)}
      </div>
    );
  }

  if (isError || !data) {
    return <div className="text-sm text-red-600">Could not load the board.</div>;
  }

  return (
    <div>
      <Link
        to={`/workspaces/${data.project.workspace_id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft size={16} /> Back to projects
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">{data.project.name}</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {data.columns.map((col) => (
          <div key={col.id} className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{col.name}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {col.tasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {col.tasks.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">No tasks yet</p>
              )}
            </div>
            <QuickAdd columnId={col.id} projectId={data.project.id} />
          </div>
        ))}
      </div>
    </div>
  );
}