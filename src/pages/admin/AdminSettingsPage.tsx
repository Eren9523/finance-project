import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Globe, 
  Monitor, 
  Bell, 
  FlaskConical,
  Save,
  Upload,
  RotateCcw,
  Loader2,
  BookOpen,
  HelpCircle,
  X,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useSettings, SystemSettings } from '../../contexts/SettingsContext';

const tabs = [
  { id: 'general', name: '通用', icon: Settings },
  { id: 'region', name: '语言与地区', icon: Globe },
  { id: 'appearance', name: '外观与布局', icon: Monitor },
  { id: 'interaction', name: '交互与通知', icon: Bell },
  { id: 'about', name: '实验与关于', icon: FlaskConical },
];

export function AdminSettingsPage() {
  const { 
    settings: globalSettings, 
    updateSettings, 
    applySettingsToDOM, 
    isLoading: isGlobalLoading,
    showToast,
    formatDate,
    formatNumber,
    effectiveLogoUrl,
    effectiveFaviconUrl,
    t
  } = useSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpSearch, setHelpSearch] = useState('');

  // Local state initialized from context
  const [settings, setSettings] = useState<SystemSettings>(globalSettings);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleUpdate = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      applySettingsToDOM(next);
      return next;
    });
  };

  const formatLocalDate = (dateInput: Date | string | number) => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return String(dateInput);

      const tz = settings.timezone || 'Asia/Shanghai';
      const isEn = settings.language === 'en-US';

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

  const formatLocalNumber = (val: number) => {
    if (typeof val !== 'number') return String(val);
    if (settings.numberFormat === 'european') {
      return val.toLocaleString('de-DE');
    }
    return val.toLocaleString('en-US');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'logoUrl' | 'faviconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请上传有效的图片文件', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleUpdate(key, result);
        showToast(key === 'logoUrl' ? 'Logo已成功更新' : 'Favicon图标已成功更新', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBrowserNotifToggle = async () => {
    const nextVal = !settings.browserNotif;
    if (nextVal) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          showToast('浏览器桌面通知权限已开启！', 'success');
          try {
            new Notification(settings.systemName || '模型推荐助手', {
              body: '这是一条桌面通知功能测试消息。'
            });
          } catch {
            // ignore
          }
        } else {
          showToast('浏览器已拒绝通知权限，请在浏览器设置中手动开启', 'error');
        }
      } else {
        showToast('当前浏览器不支持桌面通知 API', 'error');
      }
    }
    handleUpdate('browserNotif', nextVal);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const success = await updateSettings(settings);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), parseInt(settings.toastDuration) || 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (isGlobalLoading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="p-6 md:p-10 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('通用设置')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('管理产品实例级的全局基础配置。')}</p>
            </div>
            
            <div className="space-y-8 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('系统名称')}</label>
                  <input 
                    type="text" 
                    value={settings.systemName} 
                    onChange={(e) => handleUpdate('systemName', e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('后台名称')}</label>
                  <input 
                    type="text" 
                    value={settings.adminName} 
                    onChange={(e) => handleUpdate('adminName', e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100" 
                  />
                </div>
              </div>

              {/* Logo & Favicon with consistent preview and real file upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                      <img src={effectiveLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        ref={logoInputRef} 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'logoUrl')} 
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> {t('上传图片')}
                      </button>
                      {settings.logoUrl && (
                        <button 
                          type="button"
                          onClick={() => handleUpdate('logoUrl', '')}
                          className="px-3.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> {t('恢复默认')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">Favicon</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                      <img src={effectiveFaviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        ref={faviconInputRef} 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'faviconUrl')} 
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" /> {t('上传图标')}
                      </button>
                      {settings.faviconUrl && (
                        <button 
                          type="button"
                          onClick={() => handleUpdate('faviconUrl', '')}
                          className="px-3.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> {t('恢复默认')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('默认首页')}</label>
                <select 
                  value={settings.defaultHome} 
                  onChange={(e) => handleUpdate('defaultHome', e.target.value)} 
                  className="w-full md:w-2/3 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100"
                >
                  <option value="/admin/dashboard">{t('控制面板 (/admin/dashboard)')}</option>
                  <option value="/admin/models">{t('模型管理 (/admin/models)')}</option>
                  <option value="/admin/records">{t('推荐记录 (/admin/records)')}</option>
                  <option value="/workbench">{t('智能推荐助手工作台 (/workbench)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('页脚版权信息')}</label>
                <input 
                  type="text" 
                  value={settings.footerCopyright} 
                  onChange={(e) => handleUpdate('footerCopyright', e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100" 
                />
              </div>
            </div>
          </div>
        );
      case 'region':
        return (
          <div className="p-6 md:p-10 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('语言与地区')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('配置系统的语言偏好、时区及数据显示格式。')}</p>
            </div>
            
            <div className="space-y-8 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('默认语言')}</label>
                  <select 
                    value={settings.language} 
                    onChange={(e) => handleUpdate('language', e.target.value)} 
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100"
                  >
                    <option value="zh-CN">简体中文 (zh-CN)</option>
                    <option value="en-US">English (en-US)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('时区')}</label>
                  <select 
                    value={settings.timezone} 
                    onChange={(e) => handleUpdate('timezone', e.target.value)} 
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100"
                  >
                    <option value="Asia/Shanghai">{t('中国标准时间 (UTC+08:00)')}</option>
                    <option value="UTC">{t('协调世界时 (UTC)')}</option>
                    <option value="America/New_York">{t('美国东部时间 (UTC-05:00)')}</option>
                    <option value="Europe/London">{t('格林威治时间 (UTC+00:00)')}</option>
                    <option value="Asia/Tokyo">{t('日本标准时间 (UTC+09:00)')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('日期格式')}</label>
                  <select 
                    value={settings.dateFormat} 
                    onChange={(e) => handleUpdate('dateFormat', e.target.value)} 
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY年MM月DD日">YYYY年MM月DD日</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('时间格式')}</label>
                  <select 
                    value={settings.timeFormat} 
                    onChange={(e) => handleUpdate('timeFormat', e.target.value)} 
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100"
                  >
                    <option value="HH:mm:ss">{t('24小时制')}</option>
                    <option value="hh:mm:ss A">{t('12小时制')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('数字与百分比格式')}</label>
                <select 
                  value={settings.numberFormat} 
                  onChange={(e) => handleUpdate('numberFormat', e.target.value)} 
                  className="w-full md:w-1/2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100"
                >
                  <option value="standard">1,234,567.89 (Standard)</option>
                  <option value="european">1.234.567,89 (European)</option>
                </select>
              </div>

              {/* Dynamic Live Formatting Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('当前格式实时预览')}</div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-700 dark:text-slate-300 font-mono">
                  <div><span className="text-slate-400 font-sans">{t('日期时间：')}</span>{formatLocalDate(new Date())}</div>
                  <div><span className="text-slate-400 font-sans">{t('数字样例：')}</span>{formatLocalNumber(1234567.89)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="p-6 md:p-10 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('外观与布局')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('自定义界面的视觉呈现和布局结构。')}</p>
            </div>
            
            <div className="space-y-10 max-w-3xl">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('系统主题')}</label>
                <div className="flex gap-6">
                  {[
                    { id: 'light', name: '浅色' },
                    { id: 'dark', name: '深色' },
                    { id: 'system', name: '跟随系统' }
                  ].map((themeObj, i) => (
                    <label 
                      key={themeObj.id} 
                      className={`flex-1 cursor-pointer border-2 rounded-xl p-5 flex flex-col items-center gap-4 transition-all ${
                        settings.theme === themeObj.id 
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={settings.theme === themeObj.id} 
                        onChange={() => handleUpdate('theme', themeObj.id)} 
                        className="sr-only" 
                      />
                      <div className={`w-full h-20 rounded-lg border shadow-sm flex items-center justify-center ${
                        i === 0 ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 
                        i === 1 ? 'bg-slate-900 border-slate-800' : 
                        'bg-gradient-to-r from-white to-slate-900 border-slate-300 dark:border-slate-700'
                      }`}>
                        <div className={`w-8 h-8 rounded-full ${i === 1 ? 'bg-slate-700' : 'bg-slate-100'} shadow-sm`} />
                      </div>
                      <span className={`text-sm font-medium ${settings.theme === themeObj.id ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {t(themeObj.name)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('默认内容密度')}</label>
                <select 
                  value={settings.contentDensity} 
                  onChange={(e) => handleUpdate('contentDensity', e.target.value)} 
                  className="w-full md:w-2/3 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors"
                >
                  <option value="standard">{t('标准 (默认 - 适宜大部分视口)')}</option>
                  <option value="compact">{t('紧凑 (适合小屏幕或高密度表格数据)')}</option>
                  <option value="comfortable">{t('宽松 (适合触屏及大屏设备)')}</option>
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <ToggleRow 
                  label="侧边栏默认展开" 
                  description="登录进入后台管理系统时，左侧导航栏默认保持展开或自适应折叠状态。" 
                  checked={settings.sidebarDefaultOpen} 
                  onChange={() => handleUpdate('sidebarDefaultOpen', !settings.sidebarDefaultOpen)} 
                />
                <ToggleRow 
                  label="UI 动画与过渡" 
                  description="开启页面切换、平缓淡入与卡片动画；关闭可大幅提升低配置设备的流畅度。" 
                  checked={settings.uiAnimation} 
                  onChange={() => handleUpdate('uiAnimation', !settings.uiAnimation)} 
                />
              </div>
            </div>
          </div>
        );
      case 'interaction':
        return (
          <div className="p-6 md:p-10 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('交互与通知')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('配置系统的全局交互行为和消息通知策略。')}</p>
            </div>
            
            <div className="space-y-8 max-w-3xl">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t('Toast 提示显示时长')}</label>
                <select 
                  value={settings.toastDuration} 
                  onChange={(e) => handleUpdate('toastDuration', e.target.value)} 
                  className="w-full md:w-1/2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-900 transition-colors"
                >
                  <option value="3000">{t('标准 (3秒)')}</option>
                  <option value="1500">{t('短 (1.5秒)')}</option>
                  <option value="5000">{t('长 (5秒)')}</option>
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <ToggleRow 
                  label="开启操作成功提示" 
                  description="在执行保存、修改、提交等操作成功后，在屏幕右上方弹出 Toast 提示框。" 
                  checked={settings.successToast} 
                  onChange={() => handleUpdate('successToast', !settings.successToast)} 
                />
                <ToggleRow 
                  label="浏览器桌面通知" 
                  description="允许系统向浏览器发送通知（如关键导出任务或推送通知），点击可尝试向浏览器申请授权。" 
                  checked={settings.browserNotif} 
                  onChange={handleBrowserNotifToggle} 
                />
                <ToggleRow 
                  label="危险操作二次确认" 
                  description="对于模型删除、账户重置等高危敏敏感操作，弹窗要求二次确认以防误操作。" 
                  checked={settings.dangerConfirm} 
                  onChange={() => handleUpdate('dangerConfirm', !settings.dangerConfirm)} 
                />
                <ToggleRow 
                  label="记忆上次访问页面" 
                  description="重新登录或刷新页面时，自动记住并保留前次操作所在路径。" 
                  checked={settings.rememberPage} 
                  onChange={() => handleUpdate('rememberPage', !settings.rememberPage)} 
                />
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-6 md:p-10 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('实验与关于')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('探索测试功能，查看系统版本及环境信息。')}</p>
            </div>
            
            <div className="space-y-10 max-w-3xl">
              <div className="space-y-4">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">{t('实验性功能')}</h3>
                <div className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl space-y-6">
                  <ToggleRow 
                    label="启用 Beta 预览功能" 
                    description="提前体验尚未稳定发布的新特性与推荐优化策略，界面将显示 Beta 标识。" 
                    checked={settings.betaFeatures} 
                    onChange={() => handleUpdate('betaFeatures', !settings.betaFeatures)} 
                  />
                  <ToggleRow 
                    label="显示实验性配置页面" 
                    description="在左侧导航栏展开实验性算法或模型的内部调试入口（实验室入口）。" 
                    checked={settings.expPages} 
                    onChange={() => handleUpdate('expPages', !settings.expPages)} 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">{t('系统信息')}</h3>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                  <InfoRow label="系统版本" value="v1.4.2-bank-release" />
                  <InfoRow label="服务节点" value="江苏农商联合银行 云原生集群 Node-04" />
                  <InfoRow label="推荐引擎" value="LLM Hybrid RAG + Collaborative Filtering" />
                  <InfoRow label="最后构建时间" value={formatDate(new Date())} />
                </div>
              </div>

              <div className="space-y-3 pt-2 flex flex-col sm:flex-row gap-4">
                 <button 
                   onClick={() => setShowReadmeModal(true)}
                   className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-2"
                 >
                   <BookOpen className="w-4 h-4" /> {t('查看项目说明档 (README)')}
                 </button>
                 <button 
                   onClick={() => setShowHelpModal(true)}
                   className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                 >
                   <HelpCircle className="w-4 h-4" /> {t('访问帮助中心')}
                 </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-800/50">
      <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('系统设置')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('管理平台的全局基础运行规则、外观展示与交互策略。')}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-xl transition-all active:scale-95 shadow-sm ${
            saveSuccess 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saveSuccess ? t('已成功保存') : t('保存设置')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
             <nav className="flex flex-col gap-1.5 sticky top-8">
               {tabs.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                     activeTab === tab.id 
                       ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-600/10' 
                       : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                   }`}
                 >
                   <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                   {t(tab.name)}
                 </button>
               ))}
             </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
             {renderContent()}
          </div>
        </div>
      </div>

      {/* README Modal */}
      {showReadmeModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">项目说明文档 (README.md)</h3>
              </div>
              <button onClick={() => setShowReadmeModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 text-base">江苏农商联合银行 —— 大模型驱动的模型市场智能推荐助手</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">第五届中国研究生金融科技创新大赛“揭榜挂帅”赛题获奖案例</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">一、 架构与定位</h4>
                <p>本平台旨在针对农商行金融业务场景的多样化需求，构建基于大语言模型（LLM）与双塔协同过滤协同架构的智能模型推荐平台。解决传统金融算法模型查找难、匹配准度低、跨部门复用率差等痛点。</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">二、 核心引擎与功能亮点</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>双通道推荐机制：</strong>兼具规则匹配精准度与大模型语义洞察，针对风险评估、反洗钱、营销触达等精准推导匹配方案。</li>
                  <li><strong>ModelCard 全生命周期治理：</strong>标准化 ModelCard 数据规范，涵盖参数量、时延、计算密集度、合规审计追踪。</li>
                  <li><strong>可视化流式推演：</strong>提供可视化节点流，实时展示自然语言 Prompt 匹配、特征加权、模型重排的全过程。</li>
                  <li><strong>企业级安全防护：</strong>全面支持 Cloudflare D1 / Drizzle ORM，角色权限隔离与危险动作二次确认。</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">三、 部署与环境要求</h4>
                <p className="font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-xs">
                  Node.js 18+ | Vite 5 | Express 4 / Cloudflare Worker | Tailwind CSS 3 | TypeScript
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setShowReadmeModal(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Center Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">帮助中心与常见问题</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索帮助文档、常见问题..." 
                  value={helpSearch} 
                  onChange={(e) => setHelpSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-4">
                {[
                  { q: '如何向系统新增一个新的 AI 模型 (ModelCard)？', a: '系统管理员可在后台【模型资产 -> ModelCard管理】页面，点击【新增模型】按钮，录入模型的版本、类型、上下文窗口及评估指标。' },
                  { q: '智能推荐算法是如何匹配金融业务需求的？', a: '助手通过解析用户输入的场景需求，采用向量语义相似度与金融风控特定规则模型进行综合重排，得出最适配匹配度评分。' },
                  { q: '系统设置中的各项选项更改后何时生效？', a: '外观主题、内容密度、动画过渡等属性更改后实时同步 DOM；修改系统名称、Logo 或通知策略点击【保存设置】后即刻持久化全站生效。' },
                  { q: '如果发现推荐结果偏离业务预期怎么办？', a: '可在推荐记录详情中点击【反馈】反馈不合理结果，后台算法团队将在下一个 Model Bundle 更新周期进行微调训练。' }
                ]
                .filter(item => !helpSearch || item.q.includes(helpSearch) || item.a.includes(helpSearch))
                .map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">Q:</span> {item.q}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <span className="text-xs text-slate-500">如需进一步支持，请联系金融科技技术运维团队</span>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable UI components
function ToggleRow({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) {
  const { t } = useSettings();
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <div>
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{t(label)}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t(description)}</div>
      </div>
      <button 
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  const { t } = useSettings();
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-slate-500 dark:text-slate-400">{t(label)}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono tracking-tight">{t(value)}</span>
    </div>
  );
}
