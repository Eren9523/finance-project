import React, { createContext, useContext, useState, useEffect } from 'react';
import { smallLogo } from '../data/logos';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { translate } from '../lib/i18n';

export interface SystemSettings {
  systemName: string;
  adminName: string;
  logoUrl: string;
  faviconUrl: string;
  defaultHome: string;
  footerCopyright: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'system';
  contentDensity: 'standard' | 'compact' | 'comfortable';
  sidebarDefaultOpen: boolean;
  uiAnimation: boolean;
  toastDuration: string;
  successToast: boolean;
  browserNotif: boolean;
  dangerConfirm: boolean;
  rememberPage: boolean;
  betaFeatures: boolean;
  expPages: boolean;
}

export const defaultSettings: SystemSettings = {
  systemName: '模型推荐助手',
  adminName: '模型推荐助手 - 管理后台',
  logoUrl: '',
  faviconUrl: '',
  defaultHome: '/admin/dashboard',
  footerCopyright: '© 2026 江苏农商联合银行 AI Studio. All rights reserved.',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  numberFormat: 'standard',
  theme: 'system',
  contentDensity: 'standard',
  sidebarDefaultOpen: true,
  uiAnimation: true,
  toastDuration: '3000',
  successToast: true,
  browserNotif: false,
  dangerConfirm: true,
  rememberPage: true,
  betaFeatures: false,
  expPages: false
};

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

interface SettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<boolean>;
  applySettingsToDOM: (curr: SystemSettings) => void;
  isLoading: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirmAction: (options: { title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void }) => void;
  formatDate: (dateInput: Date | string | number) => string;
  formatNumber: (val: number) => string;
  effectiveLogoUrl: string;
  effectiveFaviconUrl: string;
  t: (text: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('system_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    onConfirm: () => {}
  });

  const effectiveLogoUrl = settings.logoUrl || smallLogo;
  const effectiveFaviconUrl = settings.faviconUrl || smallLogo;

  const t = (text: string): string => {
    return translate(text, settings.language);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    const duration = parseInt(settings.toastDuration, 10) || 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const confirmAction = (options: { title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void }) => {
    if (!settings.dangerConfirm) {
      options.onConfirm();
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || t('确定删除'),
      cancelText: options.cancelText || t('取消'),
      onConfirm: () => {
        options.onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const formatDate = (dateInput: Date | string | number): string => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return String(dateInput);

      const tz = settings.timezone || 'Asia/Shanghai';
      const isEn = settings.language === 'en-US';

      // Convert date to target timezone string
      const tzString = date.toLocaleString('en-US', { timeZone: tz });
      const tzDate = new Date(tzString);

      const year = tzDate.getFullYear();
      const monthNum = tzDate.getMonth() + 1;
      const month = String(monthNum).padStart(2, '0');
      const day = String(tzDate.getDate()).padStart(2, '0');

      let hoursNum = tzDate.getHours();
      const hours = String(hoursNum).padStart(2, '0');
      const minutes = String(tzDate.getMinutes()).padStart(2, '0');
      const seconds = String(tzDate.getSeconds()).padStart(2, '0');

      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      let dateStr = `${year}-${month}-${day}`;
      if (settings.dateFormat === 'DD/MM/YYYY') {
        dateStr = `${day}/${month}/${year}`;
      } else if (settings.dateFormat === 'MM/DD/YYYY') {
        dateStr = `${month}/${day}/${year}`;
      } else if (settings.dateFormat === 'YYYY年MM月DD日') {
        dateStr = isEn ? `${monthNamesEn[tzDate.getMonth()]} ${day}, ${year}` : `${year}年${month}月${day}日`;
      }

      let timeStr = `${hours}:${minutes}:${seconds}`;
      if (settings.timeFormat === 'hh:mm:ss A') {
        const ampm = hoursNum >= 12 ? 'PM' : 'AM';
        hoursNum = hoursNum % 12 || 12;
        timeStr = `${String(hoursNum).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
      }

      return `${dateStr} ${timeStr}`;
    } catch {
      return String(dateInput);
    }
  };

  const formatNumber = (val: number): string => {
    if (typeof val !== 'number') return String(val);
    if (settings.numberFormat === 'european') {
      return val.toLocaleString('de-DE');
    }
    return val.toLocaleString('en-US');
  };

  const applySettingsToDOM = (s: SystemSettings) => {
    // 1. Theme
    const isDark =
      s.theme === 'dark' ||
      (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Content Density
    document.documentElement.setAttribute('data-density', s.contentDensity || 'standard');

    // 3. UI Animation / Transitions
    if (s.uiAnimation === false) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }

    // 4. Document Title
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin')) {
      document.title = s.adminName || '模型推荐助手 - 管理后台';
    } else {
      document.title = s.systemName || '模型推荐助手';
    }

    // 5. Favicon Link
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = s.faviconUrl || smallLogo;
  };

  useEffect(() => {
    applySettingsToDOM(settings);

    fetch('/api/admin/system/settings')
      .then(res => res.json() as Promise<{ success?: boolean; data?: Record<string, any> }>)
      .then(res => {
        if (res.success && res.data && Object.keys(res.data).length > 0) {
          const merged = { ...defaultSettings, ...res.data };
          setSettings(merged);
          localStorage.setItem('system_settings', JSON.stringify(merged));
          applySettingsToDOM(merged);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (settings.theme === 'system') {
        applySettingsToDOM(settings);
      }
    };
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>): Promise<boolean> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('system_settings', JSON.stringify(updated));
    applySettingsToDOM(updated);

    try {
      const res = await fetch('/api/admin/system/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json() as { success?: boolean };
      if (data.success && updated.successToast) {
        showToast('系统设置已成功保存并实时生效！', 'success');
      }
      return !!data.success;
    } catch (e) {
      console.error(e);
      showToast('保存设置时发生错误', 'error');
      return false;
    }
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        applySettingsToDOM, 
        isLoading, 
        showToast, 
        confirmAction,
        formatDate,
        formatNumber,
        effectiveLogoUrl,
        effectiveFaviconUrl,
        t
      }}
    >
      {children}

      {/* Floating Toast Container */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-top-3 ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Danger Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm transition-colors"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

