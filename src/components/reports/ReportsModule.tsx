import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  CheckCircle2,
  UtensilsCrossed
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { orders } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'statement'>('overview');

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'completed');
  }, [orders]);

  const totalGrossRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalDiscounts = completedOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalNetRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = completedOrders.length > 0 ? totalNetRevenue / completedOrders.length : 0;

  // Breakdown by customer number
  const customerBreakdown = useMemo(() => {
    const map = new Map<number, { ordersCount: number; totalSpent: number }>();
    completedOrders.forEach(o => {
      const prev = map.get(o.customerNumber) || { ordersCount: 0, totalSpent: 0 };
      map.set(o.customerNumber, {
        ordersCount: prev.ordersCount + 1,
        totalSpent: prev.totalSpent + o.total,
      });
    });
    return Array.from(map.entries())
      .map(([custNum, data]) => ({ custNum, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [completedOrders]);

  // Top products sold
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; category: string; qty: number; revenue: number }>();
    completedOrders.forEach(o => {
      o.items.forEach(it => {
        const key = it.product.id;
        const existing = map.get(key) || { name: it.product.name, category: it.product.category, qty: 0, revenue: 0 };
        map.set(key, {
          name: it.product.name,
          category: it.product.category,
          qty: existing.qty + it.quantity,
          revenue: existing.revenue + it.itemSubtotal,
        });
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [completedOrders]);

  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Customer No', 'Date Time', 'Cashier', 'Items Count', 'Subtotal', 'Discount', 'Total Paid', 'Payment Mode', 'Order Status'];
    const rows = completedOrders.map(o => [
      o.receiptNumber,
      `Customer #${o.customerNumber}`,
      o.timestamp,
      `"${o.cashierName}"`,
      o.items.length,
      o.subtotal.toFixed(2),
      o.discountAmount.toFixed(2),
      o.total.toFixed(2),
      o.payment.method,
      o.fulfillmentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OCD_Cafe_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#432d1e] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#824618]" />
            <span>Sales &amp; Revenue Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7a5e4b]">
            Clean real-time sales reporting by customer order and menu category.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-[#e6ded3] bg-white text-[#432d1e] font-bold text-xs hover:bg-[#faf8f5] cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-[#824618]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#f5f0e8] p-1.5 rounded-xl w-fit no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#824618] text-white shadow-xs'
              : 'text-[#593c28] hover:text-[#432d1e]'
          }`}
        >
          Sales Overview
        </button>
        <button
          onClick={() => setActiveTab('statement')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'statement'
              ? 'bg-[#824618] text-white shadow-xs'
              : 'text-[#593c28] hover:text-[#432d1e]'
          }`}
        >
          Official Sales Statement
        </button>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs">
              <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider block">
                Total Net Sales
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#824618] tabular-nums mt-1">
                {formatCurrency(totalNetRevenue)}
              </div>
              <span className="text-xs text-emerald-800 font-semibold mt-1 block">
                {completedOrders.length} completed customer orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs">
              <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider block">
                Discounts Applied (Senior / PWD)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#593c28] tabular-nums mt-1">
                {formatCurrency(totalDiscounts)}
              </div>
              <span className="text-xs text-[#7a5e4b] mt-1 block">
                Gross sales before discount: {formatCurrency(totalGrossRevenue)}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs">
              <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider block">
                Average Customer Check
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#432d1e] tabular-nums mt-1">
                {formatCurrency(averageTicket)}
              </div>
              <span className="text-xs text-[#7a5e4b] mt-1 block">
                Across Customers #1 to #30
              </span>
            </div>
          </div>

          {/* Grid: Sales by Customer #1-30 & Best Selling Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Customer 1-30 */}
            <div className="bg-white rounded-2xl border border-[#e6ded3] p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-[#432d1e] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#824618]" />
                  <span>Sales by Customer Number (1-30)</span>
                </h3>
                <p className="text-xs text-[#7a5e4b]">
                  Total orders and spending attributed to each customer buzzer/number
                </p>
              </div>

              <div className="space-y-2 pt-2 max-h-80 overflow-y-auto">
                {customerBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#7a5e4b]">
                    No sales recorded yet. Ring up Customer #1-30 at the POS!
                  </div>
                ) : (
                  customerBreakdown.map(c => (
                    <div
                      key={c.custNum}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#faf8f5] border border-[#f0e8de]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#824618] text-white flex items-center justify-center font-black text-xs">
                          {c.custNum}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#432d1e]">Customer #{c.custNum}</span>
                          <span className="text-[10px] text-[#7a5e4b] block">{c.ordersCount} order{c.ordersCount === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                      <span className="font-black text-[#824618] text-sm tabular-nums">
                        {formatCurrency(c.totalSpent)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Best Selling Products */}
            <div className="bg-white rounded-2xl border border-[#e6ded3] p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-base text-[#432d1e] flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#824618]" />
                  <span>Top-Selling Menu Items</span>
                </h3>
                <p className="text-xs text-[#7a5e4b]">
                  Most popular dishes, snacks, and beverages ordered
                </p>
              </div>

              <div className="space-y-2 pt-2 max-h-80 overflow-y-auto">
                {topProducts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#7a5e4b]">
                    No orders placed yet.
                  </div>
                ) : (
                  topProducts.map(p => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#faf8f5] border border-[#f0e8de]"
                    >
                      <div>
                        <span className="font-extrabold text-[#432d1e] block">{p.name}</span>
                        <span className="text-[10px] text-[#7a5e4b]">{p.category} · {p.qty} ordered</span>
                      </div>
                      <span className="font-black text-[#432d1e] text-sm tabular-nums">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STATEMENT TAB --- */}
      {activeTab === 'statement' && (
        <div id="printable-report" className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e6ded3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="text-center border-b border-[#f0e8de] pb-5 space-y-1">
              <div className="w-16 h-16 mx-auto bg-white p-1 rounded-xl mb-1">
                <img
                  src="/assets/aistudio/the_ocd_cafe_b2a54609.jpe"
                  alt="The O.C.D.'s cafe logo"
                  className="w-full h-full object-contain mx-auto"
                />
              </div>
              <h2 className="text-2xl font-black text-[#432d1e] uppercase tracking-wider font-sans">
                The O.C.D.&apos;s Cafe
              </h2>
              <p className="text-xs font-bold text-[#824618]">
                OFFICIAL SALES REVENUE STATEMENT
              </p>
              <p className="text-xs text-[#7a5e4b]">
                Generated by Kuya Nats
              </p>
            </div>

            <div className="space-y-4 font-sans text-xs sm:text-sm">
              <div className="bg-[#f5f0e8] text-[#432d1e] p-3 rounded-xl font-black uppercase tracking-wider text-xs">
                Sales Summary
              </div>
              <div className="px-3 space-y-2.5 text-[#432d1e]">
                <div className="flex justify-between">
                  <span>Gross Sales:</span>
                  <span className="font-bold tabular-nums">{formatCurrency(totalGrossRevenue)}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>Mandated Senior &amp; PWD Discounts:</span>
                  <span className="font-bold tabular-nums">-{formatCurrency(totalDiscounts)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-[#432d1e] pt-2 border-t border-[#f0e8de]">
                  <span>NET SALES:</span>
                  <span className="tabular-nums text-[#824618] text-xl">{formatCurrency(totalNetRevenue)}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-[#f5f0e8] text-[#432d1e] p-3 rounded-xl font-black uppercase tracking-wider text-xs mt-6">
                Transactions Ledger ({completedOrders.length} records)
              </div>
              <div className="divide-y divide-[#f5efe6] text-xs">
                {completedOrders.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#7a5e4b]">No transactions recorded yet.</div>
                ) : (
                  completedOrders.map(o => (
                    <div key={o.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-[#432d1e]">
                          Customer #{o.customerNumber} · {o.receiptNumber}
                        </span>
                        <span className="text-[10px] text-[#7a5e4b] block">
                          {formatDateTime(o.timestamp)} · {o.items.length} items · Status: {o.fulfillmentStatus}
                        </span>
                      </div>
                      <span className="font-black text-[#824618] text-sm tabular-nums">
                        {formatCurrency(o.total)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
