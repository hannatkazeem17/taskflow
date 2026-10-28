import { useState } from 'react';
import { Outlet, NavLink } from 'react-router';
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, CalendarDays } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const mobileNavLinks = [
  { to: '/', label: 'Today', icon: CalendarDays },
  { to: '/workspaces', label: 'Spaces', icon: FolderKanban },
  { to: '/my-tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar Drawer (controlled by Topbar menu button) */}
      <div className="md:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation (matches design doc) */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-around border-t border-border bg-white md:hidden">
          {mobileNavLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}