import { http, HttpResponse } from 'msw';

const API = '/api/v1';

const fakeUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'student@oau.edu.ng',
  full_name: 'Test Student',
  avatar_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
};

const fakeWorkspaces = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Computer Science',
    slug: 'computer-science',
    owner_id: fakeUser.id,
    created_at: new Date().toISOString(),
  },
];

const fakeProject = {
  id: '22222222-2222-2222-2222-222222222222',
  workspace_id: fakeWorkspaces[0].id,
  name: 'CSC 401 - Final Year Project',
  description: 'Group project for the final year course.',
  color: '#0e7c86',
  archived_at: null,
  created_by: fakeUser.id,
};

const fakeColumns = [
  { id: 'c1', project_id: fakeProject.id, name: 'To Do', position: 1.0, is_done_column: false },
  { id: 'c2', project_id: fakeProject.id, name: 'In Progress', position: 2.0, is_done_column: false },
  { id: 'c3', project_id: fakeProject.id, name: 'Review', position: 3.0, is_done_column: false },
  { id: 'c4', project_id: fakeProject.id, name: 'Done', position: 4.0, is_done_column: true },
];

const fakeTasks = [
  {
    id: 't1',
    project_id: fakeProject.id,
    column_id: 'c1',
    parent_id: null,
    title: 'Submit lab report',
    description: 'Write up the results from the chemistry lab.',
    priority: 'high',
    status: 'todo',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    position: 1000.0,
    assignees: [fakeUser],
    labels: [{ id: 'l1', name: 'Urgent', color: '#e4572e' }],
    subtask_count: 4,
    subtask_done: 0,
  },
  {
    id: 't2',
    project_id: fakeProject.id,
    column_id: 'c1',
    parent_id: null,
    title: 'Group meeting prep',
    description: 'Prepare slides for the group meeting.',
    priority: 'medium',
    status: 'todo',
    due_date: new Date(Date.now() + 172800000).toISOString(),
    position: 2000.0,
    assignees: [fakeUser],
    labels: [],
    subtask_count: 5,
    subtask_done: 2,
  },
  {
    id: 't3',
    project_id: fakeProject.id,
    column_id: 'c2',
    parent_id: null,
    title: 'Revise for midterm',
    description: 'Focus on chapters 3 and 4.',
    priority: 'urgent',
    status: 'in_progress',
    due_date: new Date(Date.now() + 259200000).toISOString(),
    position: 1500.0,
    assignees: [fakeUser],
    labels: [],
    subtask_count: 0,
    subtask_done: 0,
  },
];

const atRiskTask = {
  id: 't4',
  project_id: fakeProject.id,
  column_id: 'c1',
  parent_id: null,
  title: 'Submit chemistry report',
  description: '',
  priority: 'high',
  status: 'todo',
  due_date: new Date(Date.now() + 86400000).toISOString(),
  position: 3000.0,
  assignees: [fakeUser],
  labels: [],
  subtask_count: 4,
  subtask_done: 0,
};

export const handlers = [
  // Auth
  http.post(`${API}/auth/login`, async () => {
    return HttpResponse.json({
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      token_type: 'bearer',
    });
  }),

  http.post(`${API}/auth/register`, async () => {
    return HttpResponse.json({ ...fakeUser, message: 'Account created' }, { status: 201 });
  }),

  http.get(`${API}/users/me`, () => {
    return HttpResponse.json(fakeUser);
  }),

  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'fake-new-access-token',
      refresh_token: 'fake-new-refresh-token',
      token_type: 'bearer',
    });
  }),

  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),

  // Workspaces
  http.get(`${API}/workspaces`, () => {
    return HttpResponse.json({ items: fakeWorkspaces, next_cursor: null, has_more: false });
  }),

  http.post(`${API}/workspaces`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(
      {
        id: crypto.randomUUID(),
        name: body.name,
        slug: body.name.toLowerCase().replace(/\s+/g, '-'),
        owner_id: fakeUser.id,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get(`${API}/workspaces/:id/projects`, () => {
    return HttpResponse.json({ items: [fakeProject], next_cursor: null, has_more: false });
  }),

  http.post(`${API}/workspaces/:id/projects`, async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string };
    return HttpResponse.json(
      {
        ...fakeProject,
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description || '',
      },
      { status: 201 }
    );
  }),

  // Board
  http.get(`${API}/projects/:id/board`, () => {
    return HttpResponse.json({
      project: fakeProject,
      columns: fakeColumns.map((col) => ({
        ...col,
        tasks: fakeTasks.filter((t) => t.column_id === col.id),
      })),
    });
  }),

  // Tasks
  http.get(`${API}/tasks/me`, () => {
    return HttpResponse.json({ items: [...fakeTasks, atRiskTask], next_cursor: null, has_more: false });
  }),

  http.post(`${API}/tasks`, async ({ request }) => {
    const body = (await request.json()) as { title: string; column_id: string; project_id: string };
    return HttpResponse.json(
      {
        id: crypto.randomUUID(),
        project_id: body.project_id,
        column_id: body.column_id,
        parent_id: null,
        title: body.title,
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: null,
        position: 5000.0,
        assignees: [],
        labels: [],
        subtask_count: 0,
        subtask_done: 0,
      },
      { status: 201 }
    );
  }),

  http.patch(`${API}/tasks/:id`, async ({ request }) => {
    const body = (await request.json()) as { status?: string };
    return HttpResponse.json({ ...fakeTasks[0], ...body });
  }),
];