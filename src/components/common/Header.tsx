import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  BellRing,
  LayoutDashboard,
  UtensilsCrossed,
  BarChart3,
  Users,
  CalendarDays,
  Wifi,
  WifiOff,
  Lock,
  RefreshCw,
  Tablet,
  Laptop,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Image as ImageIcon,
  HardDrive,
  Download,
  Upload,
  LogOut
} from 'lucide-react';
import { MenuBoardReferenceModal } from './MenuBoardReferenceModal';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isTabletMode,
    setIsTabletMode,
    isOnline,
    setIsOnline,
    pendingSyncCount,
    syncOfflineData,
    currentStaff,
    setIsLocked,
    orders,
    exportBackupData,
    importBackupData,
    showToast,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showStaffMenu, setShowStaffMenu] = useState(false);
  const [showMenuBoards, setShowMenuBoards] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackupData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activePreparingAndServing = orders.filter(
    o => o.fulfillmentStatus === 'preparing' || o.fulfillmentStatus === 'serving'
  ).length;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOfflineData();
    setIsSyncing(false);
  };

  interface NavItem {
    id: 'pos' | 'orders' | 'dashboard' | 'products' | 'reports' | 'staff' | 'schedule';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'pos', label: 'POS Terminal', icon: Store },
    {
      id: 'orders',
      label: 'Order Status',
      icon: BellRing,
      badge: activePreparingAndServing > 0 ? activePreparingAndServing : undefined,
    },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Menu & Prices', icon: UtensilsCrossed },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'staff', label: 'Staff & Security', icon: Users },
    { id: 'schedule', label: 'Scheduling', icon: CalendarDays },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fdfcfb] text-[#432d1e] border-b border-[#e6ded3] shadow-xs">
      {/* Offline Alert Strip if offline */}
      {!isOnline && (
        <div className="bg-[#b45309] text-amber-50 px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>
              <strong>OFFLINE MODE:</strong> Transactions saved locally on tablet. {pendingSyncCount} order{pendingSyncCount === 1 ? '' : 's'} queued for sync.
            </span>
          </div>
          <button
            onClick={() => setIsOnline(true)}
            className="underline hover:text-white text-xs cursor-pointer"
          >
            Reconnect Cloud
          </button>
        </div>
      )}

      {/* Main Top Bar in Cream White & Light Brown */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone with the attached official logo */}
        <div
          onClick={() => setActiveView('pos')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-white border border-[#dfd4c4] p-1 flex items-center justify-center shadow-xs overflow-hidden">
            <img
              src="/assets/aistudio/the_ocd_cafe_b2a54609.jpe"
              alt="The O.C.D.'s cafe logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#432d1e] whitespace-nowrap">
                The O.C.D.&apos;s Cafe
              </span>
              <span className="hidden lg:inline text-[10px] tracking-wider font-bold uppercase bg-[#f5efe6] text-[#824618] px-2 py-0.5 rounded border border-[#e6ded3]">
                POS &amp; Order Hub
              </span>
            </div>
            <span className="text-[11px] text-[#7a5e4b] hidden sm:block">
              Tablet Point of Sale &amp; Customer Orders 1–30
            </span>
          </div>
        </div>

        {/* Navigation Zone */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#824618] text-white shadow-xs'
                    : 'text-[#593c28] hover:text-[#432d1e] hover:bg-[#f5efe6]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-[#d97706] text-white text-[10px] font-black rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action & Status Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cloud / Offline Status */}
          <div className="flex items-center gap-1.5 bg-[#f5efe6] px-2.5 py-1.5 rounded-xl border border-[#e6ded3]">
            <button
              onClick={() => setIsOnline(!isOnline)}
              title={isOnline ? 'Switch to Offline Simulation' : 'Switch to Online Mode'}
              className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-80"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold hidden sm:inline text-[11px]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 font-bold hidden sm:inline text-[11px]">Offline</span>
                </>
              )}
            </button>

            {pendingSyncCount > 0 && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title="Sync offline records to cloud"
                className="ml-1 px-2 py-0.5 bg-[#824618] hover:bg-[#6c3a14] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync ({pendingSyncCount})</span>
              </button>
            )}
          </div>

          {/* Menu Boards Photo Reference Button */}
          <button
            onClick={() => setShowMenuBoards(true)}
            title="View Original Store Signage & Menu Boards"
            className="p-1.5 rounded-xl border border-[#e6ded3] bg-[#f5efe6] hover:bg-[#ede4d8] text-[#593c28] hover:text-[#432d1e] cursor-pointer hidden sm:flex items-center gap-1.5 text-xs transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-[#824618]" />
            <span className="hidden xl:inline text-[11px] font-bold">Menu Boards</span>
          </button>

          {/* Tablet Mode Toggle */}
          <button
            onClick={() => setIsTabletMode(!isTabletMode)}
            title={isTabletMode ? 'Tablet Touch Interface Active' : 'Desktop View'}
            className={`p-1.5 rounded-xl border cursor-pointer hidden sm:flex items-center justify-center transition-colors ${
              isTabletMode
                ? 'bg-[#824618]/10 border-[#824618] text-[#824618]'
                : 'bg-[#f5efe6] border-[#e6ded3] text-[#7a5e4b]'
            }`}
          >
            {isTabletMode ? <Tablet className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
          </button>

          {/* Active Cashier Profile & Lock Button */}
          <div className="relative">
            <button
              onClick={() => setShowStaffMenu(!showStaffMenu)}
              className="flex items-center gap-2 bg-[#f5efe6] hover:bg-[#ede4d8] text-[#432d1e] px-2.5 py-1.5 rounded-xl border border-[#e6ded3] text-xs font-medium cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#824618] text-white flex items-center justify-center font-bold text-[11px]">
                {currentStaff ? currentStaff.name.charAt(0) : '?'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-extrabold leading-tight text-[#432d1e]">{currentStaff?.name || 'Kuya Nats'}</div>
                <div className="text-[10px] text-[#7a5e4b] capitalize font-medium">{currentStaff?.role || 'Admin'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7a5e4b]" />
            </button>

            {showStaffMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-[#e6ded3] rounded-2xl shadow-xl py-2 z-50 text-xs divide-y divide-[#f5efe6]">
                <div className="px-3 py-2">
                  <p className="font-bold text-[#432d1e]">{currentStaff?.name}</p>
                  <p className="text-[#7a5e4b] capitalize">{currentStaff?.role} · PIN: {currentStaff?.pin}</p>
                  <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Shift: {currentStaff?.shiftStatus === 'clocked_in' ? 'Clocked In' : 'Clocked Out'}
                  </p>
                  <div className="mt-2 pt-2 border-t border-[#f5efe6] flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    <HardDrive className="w-3 h-3 text-emerald-600" />
                    <span>Storage: Auto-Saved &amp; Persistent</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowStaffMenu(false);
                      setActiveView('staff');
                    }}
                    className="w-full text-left px-3 py-2 text-[#593c28] hover:text-[#432d1e] hover:bg-[#f5efe6] flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#824618]" />
                    <span>Manage Staff &amp; PINs</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStaffMenu(false);
                      exportBackupData();
                    }}
                    className="w-full text-left px-3 py-2 text-[#593c28] hover:text-[#432d1e] hover:bg-[#f5efe6] flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Download className="w-4 h-4 text-[#824618]" />
                    <span>Export Data Backup (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStaffMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-left px-3 py-2 text-[#593c28] hover:text-[#432d1e] hover:bg-[#f5efe6] flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Upload className="w-4 h-4 text-[#824618]" />
                    <span>Restore Data from Backup</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowStaffMenu(false);
                      setIsLocked(true);
                      showToast('Terminal locked. All session data is safely saved.', 'info');
                    }}
                    className="w-full text-left px-3 py-2 text-amber-700 hover:text-amber-800 hover:bg-[#f5efe6] flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock Terminal / Switch User</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowStaffMenu(false);
                      setIsLocked(true);
                      showToast('Logged out safely. All customer orders, tickets, and prices are preserved.', 'success');
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out (Preserves All Data)</span>
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-3 py-2 bg-[#f5efe6] border-t border-[#e6ded3] gap-1.5 scrollbar-none">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive ? 'bg-[#824618] text-white shadow-xs' : 'text-[#593c28] hover:bg-[#ede4d8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 bg-[#d97706] text-white text-[9px] font-black rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showMenuBoards && (
        <MenuBoardReferenceModal onClose={() => setShowMenuBoards(false)} />
      )}
    </header>
  );
};
