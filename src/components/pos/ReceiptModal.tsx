import React from 'react';
import { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, Check, X, ShieldCheck, WifiOff } from 'lucide-react';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#faf8f5] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e6ded3] flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#f5f0e8] text-[#432d1e] p-3.5 flex items-center justify-between border-b border-[#e6ded3] no-print">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-700" />
            <span className="font-extrabold text-sm">Order Placed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#ede4d8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[#faf8f5]">
          <div
            id="printable-receipt"
            className="bg-white p-5 rounded-2xl border border-[#e6ded3] shadow-xs text-[#432d1e] font-mono text-xs space-y-3"
          >
            {/* Header with Official Logo & Customer Number */}
            <div className="text-center border-b border-dashed border-[#cfbead] pb-3 space-y-2">
              <div className="w-16 h-16 mx-auto bg-white rounded-xl p-1 flex items-center justify-center">
                <img
                  src="/assets/aistudio/the_ocd_cafe_b2a54609.jpe"
                  alt="The O.C.D.'s cafe logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h2 className="text-base font-black tracking-wider uppercase font-sans text-[#432d1e]">
                The O.C.D.&apos;s Cafe
              </h2>

              {/* Big Customer Callout (1 to 30) */}
              <div className="my-2 py-1.5 px-3 bg-[#f5efe6] border border-[#dec7b7] rounded-xl inline-block">
                <span className="text-[10px] font-bold uppercase text-[#7a5e4b] block">Customer Order</span>
                <span className="text-2xl font-black text-[#824618] font-sans">
                  #{order.customerNumber}
                </span>
              </div>

              <div className="text-[10px] text-[#7a5e4b] space-y-0.5">
                <div>Receipt: <span className="font-bold">{order.receiptNumber}</span></div>
                <div>Date: {formatDateTime(order.timestamp)}</div>
                <div>Cashier: <span className="font-semibold">{order.cashierName}</span></div>
                <div className="font-bold text-[#b45309] uppercase">Status: Preparing</div>
              </div>
            </div>

            {/* Offline tag if offline */}
            {order.offlineCreated && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-1.5 rounded text-[10px] text-center flex items-center justify-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE RECEIPT · STORED LOCALLY</span>
              </div>
            )}

            {/* Line items */}
            <div className="border-b border-dashed border-[#cfbead] pb-3 space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase text-[#7a5e4b] border-b border-[#f5efe6] pb-1">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {order.items.map(item => (
                <div key={item.cartItemId} className="text-xs">
                  <div className="grid grid-cols-12">
                    <span className="col-span-6 font-semibold truncate pr-1">
                      {item.product.name}
                      {item.selectedSize && ` (${item.selectedSize.name})`}
                    </span>
                    <span className="col-span-2 text-center tabular-nums">{item.quantity}</span>
                    <span className="col-span-2 text-right tabular-nums">{item.unitPrice.toFixed(2)}</span>
                    <span className="col-span-2 text-right font-bold tabular-nums">{item.itemSubtotal.toFixed(2)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-[#7a5e4b] italic pl-2">
                      ↳ {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals - NO VAT TAX */}
            <div className="border-b border-dashed border-[#cfbead] pb-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="tabular-nums">{order.subtotal.toFixed(2)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Discount ({order.discountType.toUpperCase()} {order.discountPercentage}%):</span>
                  <span className="tabular-nums">-{order.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-[#432d1e] pt-1.5 border-t border-[#f5efe6]">
                <span>TOTAL AMOUNT:</span>
                <span className="tabular-nums text-[#824618]">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-b border-dashed border-[#cfbead] pb-3 space-y-1 text-xs">
              <div className="flex justify-between uppercase">
                <span>Payment Mode:</span>
                <span className="font-bold">{order.payment.method}</span>
              </div>

              {order.payment.method === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span className="tabular-nums">
                      {(order.payment.amountTendered || order.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Change:</span>
                    <span className="tabular-nums">
                      {(order.payment.change || 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {order.payment.method === 'gcash' && (
                <div className="flex justify-between">
                  <span>GCash Ref:</span>
                  <span className="font-mono text-[11px]">{order.payment.referenceNumber}</span>
                </div>
              )}

              {order.payment.method === 'card' && (
                <div className="flex justify-between">
                  <span>Card **** {order.payment.cardLast4}:</span>
                  <span className="font-mono text-[11px]">{order.payment.authCode}</span>
                </div>
              )}
            </div>

            {/* Signature & Customer Pickup reminder */}
            <div className="pt-2 text-center space-y-1">
              <p className="text-[11px] font-bold text-[#824618]">
                Please listen for Customer #{order.customerNumber} when called!
              </p>
              <p className="text-[9px] text-[#7a5e4b] pt-1">
                Thank you for ordering at The O.C.D.&apos;s Cafe!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-[#f5f0e8] p-4 flex items-center justify-between border-t border-[#e6ded3] no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-[#e6ded3] bg-white text-[#432d1e] font-bold text-xs sm:text-sm hover:bg-[#ede4d8] cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#824618]" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 text-xs sm:text-sm"
          >
            Take Next Order
          </button>
        </div>
      </div>
    </div>
  );
};
