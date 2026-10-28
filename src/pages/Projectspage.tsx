import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, ChevronLeft } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface ProjectListResponse {
  items: Project[];
}

export function ProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => apiRequest<ProjectListResponse>(`/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (newName: string) =>
      apiRequest<Project>(`/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      setIsModalOpen(false);
      setName('');
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) createMutation.mutate(name.trim());
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-red-600">Could not load projects.</div>;
  }

  const projects = data?.items ?? [];

  return (
    <div>
      <Link to="/workspaces" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ChevronLeft size={16} /> All workspaces
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Courses and group work in this workspace.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" /> New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={48} />}
          title="No projects yet"
          description="Create a project to start adding tasks on a board."
          actionLabel="Create project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="rounded-xl border border-border bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="mb-3 h-1.5 w-12 rounded-full"
                style={{ backgroundColor: p.color || '#14b8a6' }}
              />
              <h3 className="font-semibold text-slate-900">{p.name}</h3>
              {p.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.description}</p>}
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New project">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Project name"
            placeholder="e.g. CSC 401 Final Year Project"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}