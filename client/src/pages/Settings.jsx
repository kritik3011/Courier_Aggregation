import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { settingsAPI } from '../services/api';
import { Card, Button, Modal } from '../components/UI';
import { 
  HiOutlineCog, 
  HiOutlineBell, 
  HiOutlineMoon, 
  HiOutlineGlobe, 
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineRefresh,
  HiOutlineDownload,
  HiOutlineLockClosed,
  HiOutlineExclamation
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const { settings: globalSettings, updateSettings: updateGlobalSettings, resetSettings: resetGlobalSettings } = useSettings();
  
  // Local settings state (for form)
  const [settings, setSettings] = useState(globalSettings);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Export state
  const [exporting, setExporting] = useState(false);
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Sync with global settings
  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(globalSettings);
    setHasChanges(changed);
  }, [settings, globalSettings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateGlobalSettings(settings);
      if (result.success) {
        toast.success('Settings saved successfully!');
        setHasChanges(false);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetGlobalSettings();
      toast.success('Settings reset to default!');
    } catch (error) {
      toast.error('Error resetting settings');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setChangingPassword(true);
    try {
      const response = await settingsAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await settingsAPI.exportData();
      
      if (response.data.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `courier-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Data exported successfully!');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      toast.error('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      toast.error('Please enter your email to confirm');
      return;
    }
    
    try {
      const response = await settingsAPI.requestDeletion();
      if (response.data.success) {
        toast.success(response.data.message);
        setShowDeleteModal(false);
        setDeleteConfirmation('');
      }
    } catch (error) {
      toast.error('Error processing request');
    }
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-dark-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingRow = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-dark-700/50 last:border-0">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h4 className="font-medium text-dark-100">{title}</h4>
          <p className="text-sm text-dark-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
            <HiOutlineCog className="w-8 h-8 text-primary-400" />
            Settings
          </h1>
          <p className="text-dark-400 mt-1">Manage your account preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <HiOutlineRefresh className="w-5 h-5" />
            Reset
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
            <HiOutlineCheck className="w-5 h-5" />
            {hasChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <HiOutlineMoon className="w-5 h-5 text-primary-400" />
          Appearance
        </h3>
        
        <SettingRow
          icon={HiOutlineMoon}
          title="Dark Mode"
          description="Use dark theme across the dashboard"
        >
          <ToggleSwitch 
            enabled={settings.darkMode} 
            onChange={() => handleToggle('darkMode')} 
          />
        </SettingRow>

        <SettingRow
          icon={HiOutlineDocumentText}
          title="Compact View"
          description="Show more items in tables and lists"
        >
          <ToggleSwitch 
            enabled={settings.compactView} 
            onChange={() => handleToggle('compactView')} 
          />
        </SettingRow>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <HiOutlineBell className="w-5 h-5 text-primary-400" />
          Notifications
        </h3>
        
        <SettingRow
          icon={HiOutlineMail}
          title="Email Notifications"
          description="Receive important updates via email"
        >
          <ToggleSwitch 
            enabled={settings.emailNotifications} 
            onChange={() => handleToggle('emailNotifications')} 
          />
        </SettingRow>

        <SettingRow
          icon={HiOutlineBell}
          title="Shipment Updates"
          description="Get notified about shipment status changes"
        >
          <ToggleSwitch 
            enabled={settings.shipmentUpdates} 
            onChange={() => handleToggle('shipmentUpdates')} 
          />
        </SettingRow>

        <SettingRow
          icon={HiOutlineMail}
          title="Marketing Emails"
          description="Receive promotional offers and news"
        >
          <ToggleSwitch 
            enabled={settings.marketingEmails} 
            onChange={() => handleToggle('marketingEmails')} 
          />
        </SettingRow>

        <SettingRow
          icon={HiOutlineDocumentText}
          title="Weekly Reports"
          description="Get weekly summary of your shipping activity"
        >
          <ToggleSwitch 
            enabled={settings.weeklyReports} 
            onChange={() => handleToggle('weeklyReports')} 
          />
        </SettingRow>
      </Card>

      {/* Shipping Preferences */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <HiOutlineGlobe className="w-5 h-5 text-primary-400" />
          Shipping Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">Default Service Type</label>
              <select 
                className="input"
                value={settings.defaultServiceType}
                onChange={(e) => handleChange('defaultServiceType', e.target.value)}
              >
                <option value="economy">Economy (4-6 days)</option>
                <option value="standard">Standard (2-4 days)</option>
                <option value="express">Express (1-2 days)</option>
                <option value="overnight">Overnight</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Currency</label>
              <select 
                className="input"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Timezone</label>
              <select 
                className="input"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
              </select>
            </div>
          </div>

          <SettingRow
            icon={HiOutlineDocumentText}
            title="Auto Generate Labels"
            description="Automatically generate shipping labels after creating orders"
          >
            <ToggleSwitch 
              enabled={settings.autoGenerateLabel} 
              onChange={() => handleToggle('autoGenerateLabel')} 
            />
          </SettingRow>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
          <HiOutlineShieldCheck className="w-5 h-5 text-primary-400" />
          Privacy & Security
        </h3>
        
        <SettingRow
          icon={HiOutlineLockClosed}
          title="Change Password"
          description="Update your account password"
        >
          <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>
            Change
          </Button>
        </SettingRow>

        <SettingRow
          icon={HiOutlineShieldCheck}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        >
          <ToggleSwitch 
            enabled={settings.twoFactorAuth} 
            onChange={() => handleToggle('twoFactorAuth')} 
          />
        </SettingRow>

        <SettingRow
          icon={HiOutlineGlobe}
          title="Share Analytics"
          description="Help us improve by sharing anonymous usage data"
        >
          <ToggleSwitch 
            enabled={settings.shareAnalytics} 
            onChange={() => handleToggle('shareAnalytics')} 
          />
        </SettingRow>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <HiOutlineExclamation className="w-5 h-5" />
          Danger Zone
        </h3>
        
        <div className="flex items-center justify-between py-4 border-b border-dark-700/50">
          <div>
            <h4 className="font-medium text-dark-100">Export Data</h4>
            <p className="text-sm text-dark-400 mt-0.5">
              Download all your shipment data as JSON
            </p>
          </div>
          <Button 
            variant="secondary"
            onClick={handleExportData}
            loading={exporting}
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <h4 className="font-medium text-dark-100">Delete Account</h4>
            <p className="text-sm text-dark-400 mt-0.5">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button 
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <HiOutlineTrash className="w-5 h-5" />
            Delete
          </Button>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="bg-dark-800/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-dark-400">Logged in as</p>
            <p className="font-medium text-dark-100">{user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-dark-400">Account Type</p>
            <p className="font-medium text-dark-100 capitalize">{user?.role}</p>
          </div>
        </div>
      </Card>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} loading={changingPassword}>
              Update Password
            </Button>
          </>
        }
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="input-group">
            <label className="input-label">Current Password</label>
            <input
              type="password"
              className="input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input
              type="password"
              className="input"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              minLength={6}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== user?.email}
            >
              Delete My Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 font-medium">⚠️ This action cannot be undone</p>
            <p className="text-dark-300 text-sm mt-2">
              Deleting your account will permanently remove all your data including shipments, 
              tracking history, and preferences.
            </p>
          </div>
          <div className="input-group">
            <label className="input-label">Type your email to confirm: <span className="text-primary-400">{user?.email}</span></label>
            <input
              type="email"
              className="input"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
