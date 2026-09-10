import React from 'react';
import { 
  Map, 
  AlertTriangle, 
  BarChart3, 
  Building2, 
  Settings, 
  ShieldAlert, 
  Radio, 
  X,
  UserCheck,
  ChevronRight,
  Activity
} from 'lucide-react';

export type TabId = 'map' | 'alerts' | 'analytics' | 'affected' | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  activeAlertCount?: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const MENU_ITEMS = [
  {
    id: 'map' as TabId,
    label: 'Live Map',
    icon: Map,
    badge: 'LIVE',
    badgeColor: 'bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30',
  },
  {
    id: 'alerts' as TabId,
    label: 'Flood Alerts',
    icon: AlertTriangle,
    badge: '3 CRIT',
    badgeColor: 'bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30 animate-pulse',
  },
  {
    id: 'analytics' as TabId,
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'affected' as TabId,
    label: 'Affected Areas',
    icon: Building2,
    badge: '11 Towns',
    badgeColor: 'bg-[#FFE66D]/20 text-[#FFE66D] border border-[#FFE66D]/30',
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
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container: 250px on desktop, 70px on tablet, 250px slide-over drawer on mobile */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-[#1a1a1a] text-slate-200 border-r border-[#262626] transition-all duration-300 select-none
          w-[250px] md:w-[76px] lg:w-[250px]
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 md:translate-x-0'}
        `}
      >
        {/* Top: Brand / Logo */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#262626]">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectTab('map')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#e63946] flex items-center justify-center shadow-lg shadow-[#FF6B6B]/20 flex-shrink-0 relative">
                <ShieldAlert className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4ECDC4] rounded-full border-2 border-[#1a1a1a]"></span>
              </div>
              <div className="hidden lg:block md:hidden truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white font-sans">
                    FLOODGUARD <span className="text-[#FF6B6B]">AI</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight block">
                  NDRF Emergency Ops Desk
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Operational Status Pill */}
          <div className="p-3 hidden lg:block md:hidden">
            <div className="bg-[#121212] border border-[#2d2d2d] rounded-xl px-3 py-2 flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-pulse"></span>
                LIVE SENSORS: 48 GAUGES
              </span>
              <span className="text-[#FFE66D] font-bold">ACTIVE</span>
            </div>
          </div>

          {/* Navigation Menu Items */}
          <nav className="p-2 space-y-1 mt-2">
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
                      ? 'bg-[#FF6B6B]/15 text-white border border-[#FF6B6B]/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/30' 
                        : 'bg-[#262626] text-slate-400 group-hover:text-white group-hover:bg-[#333333]'
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
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-[#262626]">
          <div className="p-2.5 bg-[#121212] border border-[#2d2d2d] rounded-xl flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center font-bold text-xs text-white">
                RV
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4ECDC4] rounded-full border border-[#1a1a1a]"></span>
            </div>

            <div className="hidden lg:block md:hidden truncate">
              <div className="text-xs font-bold text-white font-sans truncate">
                Cmdr. R. Verma
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                NDRF 14th Bn • On Duty
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
