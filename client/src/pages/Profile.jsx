import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineOfficeBuilding, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Profile Settings</h1>
        <p className="text-dark-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/30">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-dark-100">{user?.name}</h2>
            <p className="text-dark-400">{user?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              user?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
              user?.role === 'staff' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-6">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="relative">
              <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-12"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="email"
                value={user?.email}
                className="input pl-12 bg-dark-800 cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-dark-500 mt-1">Email cannot be changed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Phone</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="+91 98765..."
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Company</label>
              <div className="relative">
                <HiOutlineOfficeBuilding className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="Your Company"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-6">Change Password</h3>
        <form className="space-y-4">
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input type="password" className="input pl-12" placeholder="••••••••" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="secondary">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Info */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-400">Account Type</span>
            <span className="text-dark-200 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Account Status</span>
            <span className="text-green-400">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Member Since</span>
            <span className="text-dark-200">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
