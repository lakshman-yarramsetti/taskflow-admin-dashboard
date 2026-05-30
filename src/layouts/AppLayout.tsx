import { LayoutDashboard, ListTodo, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../auth/useAuth';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleNavItems = user?.role === 'employee' ? navItems : [...navItems, { to: '/users', label: 'Users', icon: Users }];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white md:block">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h1 className="text-lg font-semibold">TaskFlow</h1>
          <p className="mt-1 text-sm text-zinc-500">RBAC Dashboard</p>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex h-11 items-center gap-3 rounded px-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-500">Signed in as</p>
              <p className="truncate font-semibold text-zinc-950">{user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium capitalize text-zinc-700 sm:inline-flex">
                {user?.role}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <nav className={clsx('mt-3 grid gap-2 md:hidden', visibleNavItems.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex h-10 items-center justify-center gap-2 rounded text-sm font-medium',
                    isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-700',
                  )
                }
              >
                <item.icon size={16} />
                <span className="hidden min-[420px]:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



