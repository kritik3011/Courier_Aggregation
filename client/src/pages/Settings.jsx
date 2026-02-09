import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/UI';
import { 
  HiOutlineCog, 
  HiOutlineBell, 
  HiOutlineMoon, 
  HiOutlineGlobe, 
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineCheck
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Appearance
    darkMode: true,
    compactView: false,
    
    // Notifications
    emailNotifications: true,
    shipmentUpdates: true,
    marketingEmails: false,
    weeklyReports: true,
    
    // Preferences
    defaultCourier: '',
    defaultServiceType: 'standard',
    autoGenerateLabel: true,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    
    // Privacy
    shareAnalytics: true,
    twoFactorAuth: false
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-dark-600'
      }`}
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
        <div className="w-10 h-10 rounded-lg bg-dark-700/50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h4 className="font-medium text-dark-100">{title}</h4>
          <p className="text-sm text-dark-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
            <HiOutlineCog className="w-8 h-8 text-primary-400" />
            Settings
          </h1>
          <p className="text-dark-400 mt-1">Manage your account preferences</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <HiOutlineCheck className="w-5 h-5" />
          Save Changes
        </Button>
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
          <HiOutlineTrash className="w-5 h-5" />
          Danger Zone
        </h3>
        
        <div className="flex items-center justify-between py-4">
          <div>
            <h4 className="font-medium text-dark-100">Delete Account</h4>
            <p className="text-sm text-dark-400 mt-0.5">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button 
            variant="danger"
            onClick={() => toast.error('Account deletion is disabled in demo mode')}
          >
            Delete Account
          </Button>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-dark-700/50">
          <div>
            <h4 className="font-medium text-dark-100">Export Data</h4>
            <p className="text-sm text-dark-400 mt-0.5">
              Download all your shipment data as CSV
            </p>
          </div>
          <Button 
            variant="secondary"
            onClick={() => toast.success('Export started! You will receive an email shortly.')}
          >
            Export Data
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
    </div>
  );
}
