import React from 'react';
import { 
  Home, 
  Bell, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  X,
  ChevronRight,
  Radio
} from 'lucide-react';

export type TabId = 'map' | 'alerts' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  activeAlertCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfile?: () => void;
}

const MENU_ITEMS = [
  {
    id: 'map' as TabId,
    label: 'Home',
    icon: Home,
    badge: 'LIVE',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  {
    id: 'alerts' as TabId,
    label: 'Flood Alerts',
    icon: Bell,
    badge: '3 CRIT',
    badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse',
  },
  {
    id: 'analytics' as TabId,
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'settings' as TabId,
    label: 'Settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount = 3,
  isMobileOpen,
  onCloseMobile,
  onOpenProfile,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: 250px on desktop, 76px on tablet, 250px slide-over drawer on mobile */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-white text-slate-700 border-r border-slate-200 shadow-sm transition-all duration-300 select-none
          w-[250px] md:w-[76px] lg:w-[250px]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 md:translate-x-0'}
        `}
      >
        {/* Top: Brand / Logo */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectTab('map')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0 relative">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="hidden lg:block md:hidden truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-slate-900 font-sans">
                    FLOODGUARD <span className="text-blue-600">AI</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono tracking-tight block">
                  NDRF Emergency Ops Desk
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Operational Status Pill */}
          <div className="p-3 hidden lg:block md:hidden">
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] font-mono text-blue-900 shadow-xs">
              <span className="flex items-center gap-1.5 text-blue-900 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE SENSORS: 48 GAUGES
              </span>
              <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300 text-[10px]">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-2 space-y-1 mt-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/90 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' 
                        : 'bg-slate-100 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="hidden lg:inline md:hidden text-[13px] font-sans">
                      {item.label}
                    </span>
                  </div>

                  {/* Badges on Desktop */}
                  {item.badge && (
                    <span className={`hidden lg:inline md:hidden text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section (Interactive) */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={onOpenProfile}
            className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all group shadow-xs cursor-pointer"
            title="Click to view Officer Profile, Readiness Status & Authorizations"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white group-hover:scale-105 transition-transform shadow-xs">
                  RV
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>

              <div className="hidden lg:block md:hidden truncate">
                <div className="text-xs font-bold text-slate-900 font-sans truncate flex items-center gap-1">
                  <span>Cmdr. R. Verma</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  NDRF 14th Bn • On Duty
                </div>
              </div>
            </div>

            <ChevronRight className="hidden lg:block md:hidden w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
