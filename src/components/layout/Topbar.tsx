import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {user?.full_name?.charAt(0) ?? 'U'}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.full_name ?? 'User'}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}