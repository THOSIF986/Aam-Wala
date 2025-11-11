import { useState, useEffect } from 'react';

interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  currency: string;
  fiscalYearStart: string;
}

const defaultSettings: CompanySettings = {
  companyName: "",
  address: "",
  phone: "",
  email: "",
  gst: "",
  currency: "INR",
  fiscalYearStart: "april"
};

export const useCompanySettings = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setCompanySettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing company settings:', error);
      }
    }
  }, []);

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    const updatedSettings = { ...companySettings, ...newSettings };
    setCompanySettings(updatedSettings);
    localStorage.setItem('companySettings', JSON.stringify(updatedSettings));
  };

  return {
    companySettings,
    updateCompanySettings
  };
};