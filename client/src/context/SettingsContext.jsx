import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  darkMode: true,
  compactView: false,
  emailNotifications: true,
  shipmentUpdates: true,
  marketingEmails: false,
  weeklyReports: true,
  defaultServiceType: 'standard',
  autoGenerateLabel: true,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  shareAnalytics: true,
  twoFactorAuth: false
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage first for immediate UI state
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings from server on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await settingsAPI.get();
          if (response.data.success) {
            const serverSettings = { ...defaultSettings, ...response.data.data };
            setSettings(serverSettings);
            localStorage.setItem('userSettings', JSON.stringify(serverSettings));
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Use localStorage settings as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Apply compact view
  useEffect(() => {
    if (settings.compactView) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [settings.compactView]);

  const updateSettings = async (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await settingsAPI.update(newSettings);
      }
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await settingsAPI.reset();
      }
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    resetSettings,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
