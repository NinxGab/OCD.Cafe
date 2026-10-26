import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Delete, ArrowRight } from 'lucide-react';

export const PinPadLockScreen: React.FC = () => {
  const { staffList, currentStaff, loginWithPin, loginWithPassword } = useApp();

  const [pin, setPin] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState(currentStaff || staffList[0]);
  const [usePasswordTab, setUsePasswordTab] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const success = loginWithPin(nextPin);
        if (!success) {
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithPassword(selectedStaff.name, passwordInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#432d1e]/80 backdrop-blur-xs p-4 text-[#432d1e]">
      <div className="max-w-md w-full bg-[#fdfcfb] rounded-3xl p-6 sm:p-8 border border-[#e6ded3] shadow-2xl flex flex-col items-center">
        {/* Official Brand Logo */}
        <div className="w-20 h-20 rounded-2xl bg-white border border-[#dfd4c4] p-2 flex items-center justify-center shadow-xs overflow-hidden mb-3">
          <img
            src="/assets/aistudio/the_ocd_cafe_b2a54609.jpe"
            alt="The O.C.D.'s cafe logo"
            className="w-full h-full object-contain"
          />
        </div>

        <h2 className="text-xl font-black text-[#432d1e] tracking-tight">The O.C.D.&apos;s Cafe</h2>
        <p className="text-xs text-[#7a5e4b] mt-0.5 mb-5">
          Enter 4-Digit PIN to Access POS Terminal
        </p>

        {/* Staff Switch Chips */}
        <div className="w-full flex items-center justify-center gap-2 mb-5 overflow-x-auto pb-1">
          {staffList.map(s => {
            const isSelected = selectedStaff.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStaff(s);
                  setPin('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#824618] text-white shadow-xs'
                    : 'bg-[#f5efe6] text-[#593c28] hover:text-[#432d1e]'
                }`}
              >
                <span>{s.name}</span>
                <span className="text-[10px] opacity-75 uppercase">({s.role})</span>
              </button>
            );
          })}
        </div>

        {!usePasswordTab ? (
          <>
            {/* PIN Dots Display */}
            <div className="flex items-center gap-4 my-4">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-[#824618] border-[#824618] scale-110 shadow-xs'
                      : 'border-[#dfd4c4] bg-[#f5efe6]'
                  }`}
                />
              ))}
            </div>

            <p className="text-[11px] text-[#7a5e4b] mb-4">
              Default Kuya Nats PIN: <strong className="text-[#432d1e]">1234</strong>
            </p>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'].map(btn => (
                <button
                  key={btn}
                  onClick={() => (btn === 'C' ? handleClear() : handleKeyPress(btn))}
                  className="h-14 sm:h-16 rounded-2xl bg-[#f5efe6] hover:bg-[#ede4d8] active:scale-95 text-xl font-black text-[#432d1e] flex items-center justify-center shadow-xs cursor-pointer transition-all border border-[#e6ded3]"
                >
                  {btn}
                </button>
              ))}
              <button
                onClick={handleDelete}
                className="h-14 sm:h-16 rounded-2xl bg-[#f5efe6] hover:bg-[#ede4d8] active:scale-95 text-[#432d1e] flex items-center justify-center shadow-xs cursor-pointer transition-all border border-[#e6ded3]"
              >
                <Delete className="w-6 h-6 text-[#7a5e4b]" />
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 my-2">
            <div>
              <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                Enter Password for {selectedStaff.name}
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#faf8f5] border border-[#e6ded3] rounded-xl px-4 py-2.5 text-sm text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-sm cursor-pointer shadow-xs"
            >
              Unlock Terminal
            </button>
          </form>
        )}

        {/* Tab Toggle */}
        <div className="mt-6 pt-4 border-t border-[#f0e8de] w-full text-center">
          <button
            onClick={() => setUsePasswordTab(!usePasswordTab)}
            className="text-xs text-[#7a5e4b] hover:text-[#432d1e] underline cursor-pointer"
          >
            {usePasswordTab ? 'Switch to Quick 4-Digit Tablet PIN Pad' : 'Admin Login with Password instead'}
          </button>
        </div>
      </div>
    </div>
  );
};
