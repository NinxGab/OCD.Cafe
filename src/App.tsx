import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { PosTerminal } from './components/pos/PosTerminal';
import { OrderStatusPanel } from './components/orders/OrderStatusPanel';
import { CloudDashboard } from './components/dashboard/CloudDashboard';
import { ProductManager } from './components/products/ProductManager';
import { StaffManagement } from './components/staff/StaffManagement';
import { StaffSchedule } from './components/schedule/StaffSchedule';
import { ReportsModule } from './components/reports/ReportsModule';
import { PinPadLockScreen } from './components/auth/PinPadLockScreen';
import { ToastContainer } from './components/common/ToastContainer';

function MainContent() {
  const { activeView, isLocked } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#432d1e]">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'pos' && <PosTerminal />}
        {activeView === 'orders' && <OrderStatusPanel />}
        {activeView === 'dashboard' && <CloudDashboard />}
        {activeView === 'products' && <ProductManager />}
        {activeView === 'reports' && <ReportsModule />}
        {activeView === 'staff' && <StaffManagement />}
        {activeView === 'schedule' && <StaffSchedule />}
      </main>

      {isLocked && <PinPadLockScreen />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
