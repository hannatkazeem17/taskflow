import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Plus, FolderKanban } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceListResponse {
  items: Workspace[];
}

export function WorkspacesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiRequest<WorkspaceListResponse>('/workspaces'),
  });

  const createMutation = useMutation({
    mutationFn: (newName: string) =>
      apiRequest<Workspace>('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setIsModalOpen(false);
      setName('');
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      createMutation.mutate(name.trim());
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-600">
        Could not load workspaces: {(error as Error).message}
      </div>
    );
  }

  const workspaces = data?.items ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workspaces</h1>
          <p className="mt-1 text-sm text-slate-500">Your classes and groups.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          New workspace
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={48} />}
          title="No workspaces yet"
          description="Create a workspace to organise your courses, group projects, and tasks."
          actionLabel="Create workspace"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => navigate(`/workspaces/${ws.id}`)}
              className="rounded-xl border border-border bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <FolderKanban size={20} />
              </div>
              <h3 className="font-semibold text-slate-900">{ws.name}</h3>
              <p className="mt-1 text-xs text-slate-500">/{ws.slug}</p>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New workspace">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Workspace name"
            placeholder="e.g. Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}