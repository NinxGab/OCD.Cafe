import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  X,
  Banknote,
  Smartphone,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Lock,
  ArrowRight,
  User
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const {
    cartTotal,
    cartSubtotal,
    cartDiscountAmount,
    discountType,
    customerNumber,
    processCheckout,
    isOnline,
    currentStaff,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'card'>('cash');
  const [tenderedInput, setTenderedInput] = useState<string>(cartTotal.toString());
  const [gcashRef, setGcashRef] = useState<string>('');
  const [cardLast4, setCardLast4] = useState<string>('4892');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tenderedAmount = parseFloat(tenderedInput) || 0;
  const changeDue = Math.max(0, tenderedAmount - cartTotal);

  const quickPresets = [
    { label: 'Exact', value: cartTotal },
    { label: '₱100', value: 100 },
    { label: '₱200', value: 200 },
    { label: '₱500', value: 500 },
    { label: '₱1,000', value: 1000 },
  ];

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setTenderedInput('');
    } else if (val === 'DEL') {
      setTenderedInput(prev => prev.slice(0, -1));
    } else {
      setTenderedInput(prev => (prev === '0' ? val : prev + val));
    }
  };

  const handleConfirmCheckout = async () => {
    setErrorMsg(null);

    if (paymentMethod === 'cash' && tenderedAmount < cartTotal) {
      setErrorMsg('Tendered cash is less than the total payable amount.');
      return;
    }

    try {
      setIsProcessing(true);
      await processCheckout({
        method: paymentMethod,
        amountTendered: paymentMethod === 'cash' ? tenderedAmount : cartTotal,
        referenceNumber: paymentMethod === 'gcash' ? (gcashRef.trim() || `GC-${Math.floor(10000000 + Math.random() * 90000000)}`) : undefined,
        cardLast4: paymentMethod === 'card' ? cardLast4 : undefined,
      });
      setIsProcessing(false);
      onSuccess();
    } catch (err: unknown) {
      setIsProcessing(false);
      const message = err instanceof Error ? err.message : 'An error occurred during checkout.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-[#faf8f5] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#e6ded3] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#f5f0e8] text-[#432d1e] p-4 flex items-center justify-between border-b border-[#e6ded3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#824618] text-white flex items-center justify-center font-black text-sm">
              {customerNumber}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#432d1e]">
                Checkout for Customer #{customerNumber}
              </h3>
              <p className="text-xs text-[#7a5e4b]">
                Cashier: {currentStaff?.name || 'Kuya Nats'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#ede4d8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Bill Summary Banner - NO VAT TAX */}
          <div className="bg-white p-4 rounded-2xl border border-[#e6ded3] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-[#7a5e4b] uppercase tracking-wider block">
                Total Amount Due
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#824618] tabular-nums">
                {formatCurrency(cartTotal)}
              </div>
              {cartDiscountAmount > 0 && (
                <span className="text-xs text-emerald-800 font-semibold">
                  {discountType.toUpperCase()} discount applied (-{formatCurrency(cartDiscountAmount)})
                </span>
              )}
            </div>
            <div className="text-right text-xs text-[#7a5e4b] space-y-0.5">
              <div>Subtotal: <span className="font-bold tabular-nums text-[#432d1e]">{formatCurrency(cartSubtotal)}</span></div>
              <div className="font-semibold text-[#824618]">Customer Ticket #{customerNumber}</div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-[#824618] bg-[#f5efe6] text-[#824618] font-bold shadow-xs'
                    : 'border-[#e6ded3] bg-white text-[#593c28] hover:border-[#dacfc2]'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-xs sm:text-sm">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('gcash')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'gcash'
                    ? 'border-[#007dfe] bg-blue-50 text-[#007dfe] font-bold shadow-xs'
                    : 'border-[#e6ded3] bg-white text-[#593c28] hover:border-[#dacfc2]'
                }`}
              >
                <Smartphone className="w-6 h-6" />
                <span className="text-xs sm:text-sm">GCash / Maya</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#824618] bg-[#f5efe6] text-[#824618] font-bold shadow-xs'
                    : 'border-[#e6ded3] bg-white text-[#593c28] hover:border-[#dacfc2]'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs sm:text-sm">Credit / Debit</span>
              </button>
            </div>
          </div>

          {/* Cash Panel */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4 bg-white p-4 rounded-2xl border border-[#e6ded3]">
              <div className="flex flex-wrap gap-2">
                {quickPresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTenderedInput(preset.value.toString())}
                    className="px-3 py-1.5 rounded-xl border border-[#e6ded3] bg-[#faf8f5] hover:bg-[#ede4d8] text-xs font-bold text-[#432d1e] cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-1">
                    Cash Received (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-[#7a5e4b] font-bold text-lg">₱</span>
                    <input
                      type="number"
                      value={tenderedInput}
                      onChange={e => setTenderedInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xl font-black bg-[#faf8f5] border border-[#e6ded3] rounded-xl text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map(btn => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => handleKeypadPress(btn)}
                        className="py-2.5 bg-[#f5efe6] hover:bg-[#ede4d8] font-black text-sm rounded-xl text-[#432d1e] cursor-pointer active:scale-95"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-[#faf8f5] p-4 rounded-2xl border border-[#e6ded3]">
                  <div>
                    <span className="text-xs font-bold text-[#7a5e4b] uppercase block">
                      Change Due to Customer
                    </span>
                    <div className="text-3xl font-black text-emerald-700 tabular-nums mt-1">
                      {formatCurrency(changeDue)}
                    </div>
                  </div>

                  <div className="text-xs text-[#7a5e4b] pt-3 border-t border-[#e6ded3] space-y-1">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-bold">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tendered:</span>
                      <span className="font-bold">{formatCurrency(tenderedAmount)}</span>
                    </div>
                    {tenderedAmount < cartTotal && (
                      <div className="text-red-600 font-bold mt-1">
                        Remaining balance: {formatCurrency(cartTotal - tenderedAmount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'gcash' && (
            <div className="bg-white p-4 rounded-2xl border border-[#e6ded3] flex flex-col sm:flex-row items-center gap-5">
              <div className="w-32 h-32 bg-[#007dfe]/10 border-2 border-dashed border-[#007dfe]/40 rounded-2xl flex flex-col items-center justify-center p-2 shrink-0">
                <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1 w-full h-full p-1">
                    <div className="bg-[#007dfe] rounded-xs"></div>
                    <div className="bg-black rounded-xs"></div>
                    <div className="bg-[#007dfe] rounded-xs"></div>
                    <div className="bg-black rounded-xs"></div>
                    <div className="bg-[#007dfe] rounded-xs"></div>
                    <div className="bg-black rounded-xs"></div>
                    <div className="bg-[#007dfe] rounded-xs"></div>
                    <div className="bg-black rounded-xs"></div>
                    <div className="bg-[#007dfe] rounded-xs"></div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#007dfe] mt-1">Scan Cafe QR</span>
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div>
                  <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-1">
                    GCash / Maya Reference Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={gcashRef}
                    onChange={e => setGcashRef(e.target.value)}
                    placeholder="e.g. GC-89104928"
                    className="w-full bg-[#faf8f5] border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#007dfe]/50 font-mono"
                  />
                </div>
                <div className="bg-blue-50 text-blue-900 p-2.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#007dfe] shrink-0" />
                  <span>Settlement verified directly at the counter.</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-white p-4 rounded-2xl border border-[#e6ded3] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-wider">
                  CHIP
                </div>
                <div className="text-xs text-[#593c28]">
                  <p className="font-bold">Card Reader Terminal Ready</p>
                  <p className="text-[#7a5e4b]">Tap or insert card on POS reader</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-1">
                  Card Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={e => setCardLast4(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#faf8f5] border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e] font-mono tracking-widest text-center"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f5f0e8] p-4 flex items-center justify-between border-t border-[#e6ded3]">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-[#e6ded3] bg-white text-[#593c28] font-bold text-xs sm:text-sm hover:bg-[#ede4d8] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmCheckout}
            disabled={isProcessing}
            className="px-6 py-3 bg-[#824618] hover:bg-[#6c3a14] text-white font-extrabold rounded-xl shadow-sm cursor-pointer transition-all active:scale-95 text-xs sm:text-sm flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Confirm Order for Customer #{customerNumber} ({formatCurrency(cartTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
