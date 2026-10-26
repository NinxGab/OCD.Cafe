import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { formatCurrency, formatDateTime, formatTimeOnly } from '../../utils/formatters';
import {
  ChefHat,
  BellRing,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  UtensilsCrossed,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export const OrderStatusPanel: React.FC = () => {
  const { orders, updateOrderStatus, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'serving' | 'served'>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('');

  const filteredOrders = orders.filter(o => {
    const matchStatus = activeTab === 'all' || o.fulfillmentStatus === activeTab;
    const matchCust = !filterCustomer || o.customerNumber.toString() === filterCustomer;
    return matchStatus && matchCust;
  });

  const preparingCount = orders.filter(o => o.fulfillmentStatus === 'preparing').length;
  const servingCount = orders.filter(o => o.fulfillmentStatus === 'serving').length;
  const servedCount = orders.filter(o => o.fulfillmentStatus === 'served').length;

  return (
    <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#824618] bg-[#f2e6dc] px-2.5 py-0.5 rounded-full border border-[#dec7b7]">
              Kitchen &amp; Counter Order Tracking
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#432d1e] mt-1">
            Order Status &amp; Customer Pickup Panel
          </h1>
          <p className="text-xs sm:text-sm text-[#7a5e4b]">
            Track Customer #1 to #30 orders: Preparing in Kitchen → Ready at Counter Serving → Claimed &amp; Served.
          </p>
        </div>

        <button
          onClick={() => setActiveView('pos')}
          className="px-4 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-sm transition-all self-start sm:self-auto"
        >
          + Take New Order (POS)
        </button>
      </div>

      {/* KPI / Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Preparing */}
        <button
          onClick={() => setActiveTab('preparing')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            activeTab === 'preparing'
              ? 'bg-[#fffaf0] border-[#d97706] ring-2 ring-[#d97706]/30 shadow-xs'
              : 'bg-white border-[#e6ded3] hover:border-[#d97706]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#b45309] flex items-center gap-1.5">
              <ChefHat className="w-4 h-4" />
              <span>Preparing</span>
            </span>
            <span className="w-7 h-7 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-black flex items-center justify-center">
              {preparingCount}
            </span>
          </div>
          <div className="text-2xl font-black text-[#432d1e] mt-2">
            {preparingCount} Order{preparingCount === 1 ? '' : 's'}
          </div>
          <p className="text-[11px] text-[#7a5e4b] mt-0.5">
            Currently being prepared in kitchen or barista bar
          </p>
        </button>

        {/* Serving / Ready for Claim */}
        <button
          onClick={() => setActiveTab('serving')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            activeTab === 'serving'
              ? 'bg-[#f0f9ff] border-[#0284c7] ring-2 ring-[#0284c7]/30 shadow-xs'
              : 'bg-white border-[#e6ded3] hover:border-[#0284c7]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0369a1] flex items-center gap-1.5">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>Serving / Ready</span>
            </span>
            <span className="w-7 h-7 rounded-full bg-[#e0f2fe] text-[#075985] text-xs font-black flex items-center justify-center">
              {servingCount}
            </span>
          </div>
          <div className="text-2xl font-black text-[#432d1e] mt-2">
            {servingCount} Ready
          </div>
          <p className="text-[11px] text-[#7a5e4b] mt-0.5">
            Calling Customer #1-30 to counter for pickup
          </p>
        </button>

        {/* Served / Claimed */}
        <button
          onClick={() => setActiveTab('served')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            activeTab === 'served'
              ? 'bg-[#f0fdf4] border-[#16a34a] ring-2 ring-[#16a34a]/30 shadow-xs'
              : 'bg-white border-[#e6ded3] hover:border-[#16a34a]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803d] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Served &amp; Claimed</span>
            </span>
            <span className="w-7 h-7 rounded-full bg-[#dcfce7] text-[#166534] text-xs font-black flex items-center justify-center">
              {servedCount}
            </span>
          </div>
          <div className="text-2xl font-black text-[#432d1e] mt-2">
            {servedCount} Completed
          </div>
          <p className="text-[11px] text-[#7a5e4b] mt-0.5">
            Customer received items &amp; transaction concluded
          </p>
        </button>
      </div>

      {/* Filter and Quick Customer 1-30 Jump Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6ded3] space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#f5f0e8] p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'all' ? 'bg-[#824618] text-white shadow-xs' : 'text-[#593c28] hover:text-[#432d1e]'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('preparing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'preparing' ? 'bg-[#d97706] text-white shadow-xs' : 'text-[#593c28] hover:text-[#432d1e]'
              }`}
            >
              Preparing ({preparingCount})
            </button>
            <button
              onClick={() => setActiveTab('serving')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'serving' ? 'bg-[#0284c7] text-white shadow-xs' : 'text-[#593c28] hover:text-[#432d1e]'
              }`}
            >
              Serving ({servingCount})
            </button>
            <button
              onClick={() => setActiveTab('served')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'served' ? 'bg-[#16a34a] text-white shadow-xs' : 'text-[#593c28] hover:text-[#432d1e]'
              }`}
            >
              Served ({servedCount})
            </button>
          </div>

          {/* Customer Number Quick Jump */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7a5e4b] whitespace-nowrap">
              Jump to Customer #:
            </span>
            <select
              value={filterCustomer}
              onChange={e => setFilterCustomer(e.target.value)}
              className="bg-[#faf8f5] border border-[#dacfc2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/40"
            >
              <option value="">All Customers (1-30)</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num.toString()}>
                  Customer #{num}
                </option>
              ))}
            </select>
            {filterCustomer && (
              <button
                onClick={() => setFilterCustomer('')}
                className="text-xs text-[#824618] hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Customer 1 to 30 Quick Tap Grid */}
        <div className="pt-2 border-t border-[#f5f0e8]">
          <span className="text-[11px] font-bold text-[#7a5e4b] uppercase block mb-1.5">
            Quick Filter by Customer Number (1 - 30):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
              const isSelected = filterCustomer === num.toString();
              const hasActiveOrder = orders.some(o => o.customerNumber === num && o.fulfillmentStatus !== 'served');

              return (
                <button
                  key={num}
                  onClick={() => setFilterCustomer(isSelected ? '' : num.toString())}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-black flex items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#824618] text-white shadow-sm ring-2 ring-[#824618]/30'
                      : hasActiveOrder
                      ? 'bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]'
                      : 'bg-[#faf8f5] text-[#593c28] border border-[#e6ded3] hover:bg-[#ede4d8]'
                  }`}
                  title={`Customer #${num} ${hasActiveOrder ? '(Has active order)' : ''}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e6ded3] p-12 text-center text-[#7a5e4b] space-y-3">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-[#dacfc2]" />
          <h3 className="font-bold text-base text-[#432d1e]">No Orders In This View</h3>
          <p className="text-xs max-w-sm mx-auto">
            {orders.length === 0
              ? 'No sales or orders have been placed yet. Go to the POS Terminal to ring up an order for Customer #1-30!'
              : 'There are currently no orders matching the selected status or customer number filter.'}
          </p>
          <button
            onClick={() => setActiveView('pos')}
            className="px-5 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
          >
            <span>Ring Up Order in POS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const isPreparing = order.fulfillmentStatus === 'preparing';
            const isServing = order.fulfillmentStatus === 'serving';
            const isServed = order.fulfillmentStatus === 'served';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isPreparing
                    ? 'border-[#f59e0b] ring-1 ring-[#f59e0b]/30'
                    : isServing
                    ? 'border-[#0284c7] ring-1 ring-[#0284c7]/30'
                    : 'border-[#e6ded3] opacity-85'
                }`}
              >
                <div>
                  {/* Top Bar: Customer Number & Status Badge */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f5f0e8]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#824618] to-[#593c28] text-white flex flex-col items-center justify-center font-black shadow-inner">
                        <span className="text-[9px] uppercase tracking-wider opacity-80 leading-none">CUST</span>
                        <span className="text-lg leading-tight font-extrabold">{order.customerNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-[#432d1e]">
                            Customer #{order.customerNumber}
                          </h3>
                        </div>
                        <span className="text-[11px] text-[#7a5e4b] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTimeOnly(order.timestamp)}</span>
                          <span>· #{order.receiptNumber.split('-')[2] || 'ORD'}</span>
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${
                        isPreparing
                          ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                          : isServing
                          ? 'bg-[#e0f2fe] text-[#075985] border border-[#bae6fd] animate-pulse'
                          : 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]'
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </div>

                  {/* Order Items List */}
                  <div className="py-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a5e4b] block">
                      Ordered Items:
                    </span>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {order.items.map(it => (
                        <div
                          key={it.cartItemId}
                          className="flex items-center justify-between text-xs bg-[#faf8f5] p-2 rounded-lg border border-[#f0e8de]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#824618] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {it.quantity}
                            </span>
                            <div>
                              <span className="font-bold text-[#432d1e]">
                                {it.product.name}
                              </span>
                              {it.selectedSize && (
                                <span className="text-[10px] text-[#824618] font-semibold block">
                                  Variant: {it.selectedSize.name}
                                </span>
                              )}
                              {it.notes && (
                                <span className="text-[10px] text-[#7a5e4b] italic block">
                                  Note: {it.notes}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-[#593c28] tabular-nums shrink-0">
                            {formatCurrency(it.itemSubtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Preparing -> Serving -> Served */}
                <div className="pt-3 mt-2 border-t border-[#f5f0e8] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7a5e4b]">Order Total:</span>
                    <span className="font-black text-[#824618] text-base tabular-nums">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isPreparing && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'serving')}
                        className="flex-1 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>Ready &amp; Serving at Counter</span>
                      </button>
                    )}

                    {isServing && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="flex-1 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Served (Claimed by Customer)</span>
                      </button>
                    )}

                    {isServed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-[#166534] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                          <span>Order Claimed &amp; Complete</span>
                        </span>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'serving')}
                          title="Revert to serving"
                          className="px-2 py-1 text-[11px] text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#f5f0e8] rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Revert</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
