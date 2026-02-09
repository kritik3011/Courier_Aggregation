import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineChartBar,
  HiOutlineScale,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineUserGroup,
  HiOutlineSearch
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/shipments', icon: HiOutlineCube, label: 'Shipments' },
  { path: '/compare', icon: HiOutlineScale, label: 'Compare Rates' },
  { path: '/track', icon: HiOutlineTruck, label: 'Track Shipment' },
  { path: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
];

const adminItems = [
  { path: '/admin', icon: HiOutlineUserGroup, label: 'Admin Panel' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track/${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <HiOutlineTruck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg gradient-text">CourierHub</h1>
              <p className="text-xs text-dark-400">Logistics Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-4 mb-2">
            <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Main Menu</p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="px-4 mt-6 mb-2">
                <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Admin</p>
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
              <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 glass border-b border-dark-700/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-300"
            >
              {sidebarOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracking ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </form>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="p-2.5 rounded-xl hover:bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors relative">
                <HiOutlineBell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <NavLink
                to="/profile"
                className="p-2.5 rounded-xl hover:bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors"
              >
                <HiOutlineUser className="w-5 h-5" />
              </NavLink>

              {/* Settings */}
              <NavLink
                to="/settings"
                className={({ isActive }) => `p-2.5 rounded-xl hover:bg-dark-800 text-dark-300 hover:text-dark-100 transition-colors ${isActive ? 'bg-dark-800 text-primary-400' : ''}`}
              >
                <HiOutlineCog className="w-5 h-5" />
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-red-500/10 text-dark-300 hover:text-red-400 transition-colors"
              >
                <HiOutlineLogout className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
