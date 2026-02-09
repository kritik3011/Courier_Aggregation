import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Card, Button, StatusBadge, Skeleton, Modal, Input, Select } from '../components/UI';
import { HiOutlineUserGroup, HiOutlineCube, HiOutlineClipboardList, HiOutlineCog, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-primary-500/10 to-primary-600/5">
        <p className="text-sm text-dark-400">Total Users</p>
        <p className="text-3xl font-bold text-dark-100 mt-2">{stats?.totalUsers || 0}</p>
        <p className="text-sm text-dark-400 mt-1">{stats?.activeUsers || 0} active</p>
      </Card>
      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
        <p className="text-sm text-dark-400">Total Shipments</p>
        <p className="text-3xl font-bold text-dark-100 mt-2">{stats?.totalShipments || 0}</p>
      </Card>
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
        <p className="text-sm text-dark-400">Active Couriers</p>
        <p className="text-3xl font-bold text-dark-100 mt-2">{stats?.totalCouriers || 0}</p>
      </Card>
      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
        <p className="text-sm text-dark-400">Total Revenue</p>
        <p className="text-3xl font-bold text-dark-100 mt-2">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
      </Card>
    </div>
  );
}

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ open: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ limit: 50 });
      setUsers(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      await adminAPI.updateUser(id, data);
      toast.success('User updated');
      fetchUsers();
      setEditModal({ open: false, user: null });
    } catch (err) {
      toast.error('Error updating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    }
  };

  if (loading) return <Skeleton className="h-96" />;

  return (
    <>
      <Card className="p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Company</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">{user.name}</p>
                        <p className="text-sm text-dark-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'staff' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-dark-300">{user.company || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-dark-400 text-sm">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : 'Never'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => setEditModal({ open: true, user })} className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-dark-100">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(user._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-dark-400 hover:text-red-400">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, user: null })}
        title="Edit User"
        footer={
          <Button onClick={() => {
            const form = document.getElementById('editUserForm');
            handleUpdateUser(editModal.user._id, {
              name: form.name.value,
              role: form.role.value,
              isActive: form.isActive.checked
            });
          }}>Save Changes</Button>
        }
      >
        {editModal.user && (
          <form id="editUserForm" className="space-y-4">
            <Input label="Name" name="name" defaultValue={editModal.user.name} />
            <Select label="Role" name="role" defaultValue={editModal.user.role}>
              <option value="business">Business</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </Select>
            <label className="flex items-center gap-2 text-dark-300">
              <input type="checkbox" name="isActive" defaultChecked={editModal.user.isActive} className="rounded" />
              Active
            </label>
          </form>
        )}
      </Modal>
    </>
  );
}

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await adminAPI.getLogs({ limit: 50 });
      setLogs(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;

  return (
    <Card className="p-0">
      <div className="table-container max-h-[600px] overflow-y-auto">
        <table className="table">
          <thead className="sticky top-0 bg-dark-800">
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Module</th>
              <th>User</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="text-dark-400 text-sm whitespace-nowrap">
                  {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                </td>
                <td>
                  <span className="px-2 py-1 bg-dark-700 rounded text-xs text-dark-300">{log.action}</span>
                </td>
                <td className="text-dark-300">{log.module}</td>
                <td className="text-dark-300">{log.userEmail || 'System'}</td>
                <td className="text-dark-200 max-w-xs truncate">{log.description}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AdminPanel() {
  const location = useLocation();
  const tabs = [
    { path: '/admin', label: 'Overview', icon: HiOutlineCog, exact: true },
    { path: '/admin/users', label: 'Users', icon: HiOutlineUserGroup },
    { path: '/admin/logs', label: 'System Logs', icon: HiOutlineClipboardList }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Admin Panel</h1>
        <p className="text-dark-400 mt-1">Manage users, couriers, and system settings</p>
      </div>

      <div className="flex gap-2 border-b border-dark-700 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.exact ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.exact}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-dark-400 hover:text-dark-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>

      <Routes>
        <Route index element={<AdminStats />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="logs" element={<SystemLogs />} />
      </Routes>
    </div>
  );
}
