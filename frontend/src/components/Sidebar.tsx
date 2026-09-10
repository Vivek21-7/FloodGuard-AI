import React from 'react';
import { 
  Home, 
  Bell, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  X,
  Radio,
  PhoneCall,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export type TabId = 'map' | 'alerts' | 'analytics' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  activeAlertCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenProfile?: () => void;
  onOpenEmergencyDirectory?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
  onOpenProfile,
  onOpenEmergencyDirectory,
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

      {/* Sidebar Container: 250px on desktop, collapsable, 280px drawer on mobile */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-white text-slate-700 border-r border-slate-200 shadow-sm transition-all duration-300 ease-in-out select-none shrink-0
          ${isCollapsed 
            ? 'w-0 -translate-x-full overflow-hidden border-r-0 p-0 opacity-0 pointer-events-none lg:w-0 lg:p-0' 
            : 'w-[250px] translate-x-0 opacity-100'}
          ${isMobileOpen ? '!w-[280px] !translate-x-0 !opacity-100 !pointer-events-auto !overflow-visible' : ''}
        `}
      >
        {/* Top: Brand / Logo */}
        <div className="w-[250px]">
          <div className="h-16 px-3.5 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1" onClick={() => onSelectTab('map')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0 relative">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="truncate">
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

            {/* Panel Close/Collapse Button (works for both Desktop and Mobile) */}
            <button
              onClick={() => {
                if (onToggleCollapse) onToggleCollapse();
                if (isMobileOpen && onCloseMobile) onCloseMobile();
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all cursor-pointer border border-transparent hover:border-slate-200 active:scale-95 shrink-0"
              title="Close Panel"
            >
              <PanelLeftClose className="w-5 h-5 text-slate-600 hover:text-blue-600" />
            </button>
          </div>

          {/* Operational Status Pill */}
          <div className="p-3">
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
                    <span className="text-[13px] font-sans text-slate-800">
                      {item.label}
                    </span>
                  </div>

                  {/* Badges */}
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Helplines Trigger */}
          {onOpenEmergencyDirectory && (
            <div className="p-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenEmergencyDirectory();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all group shadow-2xs cursor-pointer active:scale-95"
                title="24/7 National & State Disaster Helplines"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-600 text-white shadow-xs">
                    <PhoneCall className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="text-[13px] font-sans text-rose-900">
                    Emergency 112
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-900 font-black">
                  HOTLINES
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
