import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  BellRing,
  Users,
  Wifi,
  ChevronRight,
  ArrowUpRight,
  Clock,
  UtensilsCrossed
} from 'lucide-react';

export const CloudDashboard: React.FC = () => {
  const {
    orders,
    staffList,
    setActiveView,
    updateOrderStatus,
  } = useApp();

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'completed');
  }, [orders]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const preparingOrders = orders.filter(o => o.fulfillmentStatus === 'preparing');
  const servingOrders = orders.filter(o => o.fulfillmentStatus === 'serving');
  const servedOrders = orders.filter(o => o.fulfillmentStatus === 'served');

  return (
    <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner with Official Logo */}
      <div className="bg-[#f5f0e8] text-[#432d1e] p-5 sm:p-6 rounded-3xl shadow-xs border border-[#e6ded3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#dfd4c4] p-1.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
            <img
              src="/assets/aistudio/the_ocd_cafe_b2a54609.jpe"
              alt="The O.C.D.'s cafe logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#824618] bg-[#faf8f5] px-2.5 py-0.5 rounded-full border border-[#e6ded3]">
                Cafe Management Console
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#432d1e]">
              The O.C.D.&apos;s Cafe Control Hub
            </h1>
            <p className="text-xs text-[#7a5e4b]">
              Order tracking for Customers #1 to #30 with real-time status management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('orders')}
            className="px-4 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
          >
            <BellRing className="w-4 h-4" />
            <span>Order Status ({preparingOrders.length + servingOrders.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider">
              Total Real-Time Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f5efe6] text-[#824618] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#432d1e] tabular-nums mt-2">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            {completedOrders.length} customer order{completedOrders.length === 1 ? '' : 's'} recorded
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#f5efe6] text-[#824618] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#432d1e] tabular-nums mt-2">
            {formatCurrency(averageTicket)}
          </div>
          <div className="text-xs text-[#7a5e4b] mt-1">
            Per customer transaction
          </div>
        </div>

        {/* Preparing in Kitchen */}
        <div
          onClick={() => setActiveView('orders')}
          className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs cursor-pointer hover:border-[#d97706] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider">
              Preparing in Kitchen
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#92400e] flex items-center justify-center font-bold">
              {preparingOrders.length}
            </div>
          </div>
          <div className="text-2xl font-black text-[#432d1e] tabular-nums mt-2">
            {preparingOrders.length} active
          </div>
          <div className="text-xs text-[#b45309] font-bold mt-1">
            Click to manage queue
          </div>
        </div>

        {/* Ready & Serving */}
        <div
          onClick={() => setActiveView('orders')}
          className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs cursor-pointer hover:border-[#0284c7] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider">
              Ready at Counter
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center font-bold">
              {servingOrders.length}
            </div>
          </div>
          <div className="text-2xl font-black text-[#432d1e] tabular-nums mt-2">
            {servingOrders.length} to claim
          </div>
          <div className="text-xs text-[#0284c7] font-bold mt-1">
            Calling Customer #
          </div>
        </div>
      </div>

      {/* Grid: Live Customer Orders Stream & Staff Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Order Stream (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e6ded3] p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#f5f0e8]">
            <div>
              <h3 className="font-black text-base text-[#432d1e]">
                Live Customer Orders Stream
              </h3>
              <p className="text-xs text-[#7a5e4b]">
                Active orders by Customer #1 through #30
              </p>
            </div>
            <button
              onClick={() => setActiveView('orders')}
              className="text-xs text-[#824618] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Status Panel</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#f5f0e8] overflow-y-auto max-h-[380px]">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#7a5e4b]">
                No customer orders placed yet today.
              </div>
            ) : (
              orders.slice(0, 8).map(order => (
                <div key={order.id} className="py-3 sm:py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f5efe6] border border-[#dec7b7] flex flex-col items-center justify-center text-[#824618] shrink-0 font-black">
                      <span className="text-[8px] uppercase">CUST</span>
                      <span className="text-sm leading-none font-black">#{order.customerNumber}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-[#432d1e]">
                          Customer #{order.customerNumber}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                            order.fulfillmentStatus === 'preparing'
                              ? 'bg-[#fef3c7] text-[#92400e]'
                              : order.fulfillmentStatus === 'serving'
                              ? 'bg-[#e0f2fe] text-[#075985]'
                              : 'bg-[#dcfce7] text-[#166534]'
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7a5e4b] mt-0.5">
                        {order.items.map(it => `${it.quantity}x ${it.product.name}`).join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#432d1e] tabular-nums">
                      {formatCurrency(order.total)}
                    </div>
                    <span className="text-[10px] text-[#7a5e4b]">
                      Cashier: {order.cashierName}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Staff Sales Performance */}
        <div className="bg-white rounded-2xl border border-[#e6ded3] p-5 sm:p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#f5f0e8]">
            <div>
              <h3 className="font-black text-base text-[#432d1e]">
                Active Staff
              </h3>
              <p className="text-xs text-[#7a5e4b]">
                Real-time sales by employee
              </p>
            </div>
            <button
              onClick={() => setActiveView('staff')}
              className="text-xs text-[#824618] font-bold hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-4 pt-3 flex-1 overflow-y-auto">
            {staffList.map(staff => (
              <div
                key={staff.id}
                className="p-3.5 rounded-2xl border border-[#e6ded3] bg-[#faf8f5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#824618] text-white flex items-center justify-center font-bold text-xs">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#432d1e]">{staff.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-[#824618]">{staff.role}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${staff.shiftStatus === 'clocked_in' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {staff.shiftStatus === 'clocked_in' ? 'Clocked In' : 'Off Duty'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0e8de] text-xs">
                  <div>
                    <span className="text-[10px] text-[#7a5e4b] block">Total Sales</span>
                    <span className="font-black text-[#432d1e] tabular-nums">
                      {formatCurrency(staff.totalSales)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7a5e4b] block">Orders Handled</span>
                    <span className="font-black text-[#432d1e] tabular-nums">
                      {staff.ordersProcessed} orders
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#f5f0e8]">
            <button
              onClick={() => setActiveView('schedule')}
              className="w-full py-2.5 rounded-xl border border-[#e6ded3] bg-[#faf8f5] hover:bg-[#ede4d8] text-[#432d1e] text-xs font-bold text-center cursor-pointer transition-colors"
            >
              Staff Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
