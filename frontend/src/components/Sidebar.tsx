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
    badgeColor: 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30',
  },
  {
    id: 'alerts' as TabId,
    label: 'Flood Alerts',
    icon: Bell,
    badge: '3 CRIT',
    badgeColor: 'bg-rose-500/30 text-rose-100 border border-rose-400/40 animate-pulse',
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
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: 250px on desktop, 76px on tablet, 250px slide-over drawer on mobile */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#1e3a8a] via-[#1d4ed8] to-[#1e40af] text-white border-r border-blue-400/20 shadow-xl transition-all duration-300 select-none
          w-[250px] md:w-[76px] lg:w-[250px]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 md:translate-x-0'}
        `}
      >
        {/* Top: Brand / Logo */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-blue-400/20">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectTab('map')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0 relative border border-white/20">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1e3a8a]"></span>
              </div>
              <div className="hidden lg:block md:hidden truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white font-sans">
                    FLOODGUARD <span className="text-cyan-300">AI</span>
                  </span>
                </div>
                <span className="text-[10px] text-blue-200 font-mono tracking-tight block">
                  NDRF Emergency Ops Desk
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden md:hidden p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Operational Status Pill */}
          <div className="p-3 hidden lg:block md:hidden">
            <div className="bg-blue-900/40 border border-blue-400/25 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] font-mono text-blue-100 shadow-inner">
              <span className="flex items-center gap-1.5 text-blue-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SENSORS: 48 GAUGES
              </span>
              <span className="text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30 text-[10px]">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-2 space-y-1.5 mt-1">
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
                      ? 'bg-white/20 text-white border border-white/30 shadow-md shadow-blue-950/20 backdrop-blur-md'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-sm shadow-cyan-400/40' 
                        : 'bg-white/10 text-blue-200 group-hover:text-white group-hover:bg-white/20'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="hidden lg:inline md:hidden text-[13px] font-sans font-medium">
                      {item.label}
                    </span>
                  </div>

                  {/* Badges on Desktop */}
                  {item.badge && (
                    <span className={`hidden lg:inline md:hidden text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                      item.badgeColor || 'bg-white/10 text-white'
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
        <div className="p-3 border-t border-blue-400/20">
          <button
            onClick={onOpenProfile}
            className="w-full p-2.5 bg-blue-900/40 hover:bg-blue-900/60 active:bg-blue-900/80 border border-blue-400/25 rounded-2xl flex items-center justify-between text-left transition-all group shadow-sm cursor-pointer"
            title="Click to view Officer Profile, Readiness Status & Authorizations"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-300 flex items-center justify-center font-black text-xs text-slate-950 group-hover:scale-105 transition-transform shadow-sm">
                  RV
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1e3a8a]"></span>
              </div>

              <div className="hidden lg:block md:hidden truncate">
                <div className="text-xs font-bold text-white font-sans truncate flex items-center gap-1">
                  <span>Cmdr. R. Verma</span>
                </div>
                <div className="text-[10px] text-blue-200 font-mono truncate">
                  NDRF 14th Bn • On Duty
                </div>
              </div>
            </div>

            <ChevronRight className="hidden lg:block md:hidden w-4 h-4 text-blue-300 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
