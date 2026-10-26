import React, { useState } from 'react';
import { Product, ProductSizeOption } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, Minus, Check } from 'lucide-react';

interface SizeSelectorModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (selectedSize: ProductSizeOption | undefined, quantity: number, notes: string) => void;
}

export const SizeSelectorModal: React.FC<SizeSelectorModalProps> = ({ product, onClose, onConfirm }) => {
  const [selectedSize, setSelectedSize] = useState<ProductSizeOption | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');

  const quickNotes = product.categoryId === 'espresso' || product.categoryId === 'iced_drinks' || product.categoryId === 'milk_tea' || product.categoryId === 'frappes'
    ? ['Less Sweet (50%)', 'Zero Sugar', 'Less Ice', 'Extra Ice', 'Extra Pearl', 'Add Espresso Shot']
    : ['Extra Rice', 'Egg Well Done', 'Extra Gravy', 'Spicy', 'No Onion', 'Take Out'];

  const toggleNote = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(prev => prev.filter(n => n !== note));
    } else {
      setSelectedNotes(prev => [...prev, note]);
    }
  };

  const currentPrice = selectedSize ? selectedSize.price : product.basePrice;
  const itemTotal = currentPrice * quantity;

  const handleConfirm = () => {
    const combinedNotes = [...selectedNotes, customNote.trim()].filter(Boolean).join(', ');
    onConfirm(selectedSize, quantity, combinedNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#faf8f5] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e6ded3] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#f5f0e8] text-[#432d1e] p-4 flex items-center justify-between border-b border-[#e6ded3]">
          <div>
            <h3 className="text-base sm:text-lg font-black">{product.name}</h3>
            <span className="text-xs text-[#7a5e4b]">{product.category} · Select Size &amp; Customizations</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#ede4d8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Sizes / Variants */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-2">
                Choose Size / Variant
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.sizes.map(opt => {
                  const isSelected = selectedSize?.name === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedSize(opt)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#824618] bg-[#f5efe6] ring-2 ring-[#824618]/25'
                          : 'border-[#e6ded3] bg-white hover:border-[#dacfc2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#432d1e]">{opt.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#824618]" />}
                      </div>
                      <span className="text-sm font-black text-[#824618] mt-1 tabular-nums">
                        {formatCurrency(opt.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Modifier Chips */}
          <div>
            <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-2">
              Order Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {quickNotes.map(note => {
                const isSelected = selectedNotes.includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => toggleNote(note)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#824618] text-white border-[#824618]'
                        : 'bg-white text-[#593c28] border-[#e6ded3] hover:bg-[#f5efe6]'
                    }`}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions Input */}
          <div>
            <label className="block text-xs font-bold text-[#593c28] uppercase tracking-wider mb-1">
              Custom Kitchen / Barista Note
            </label>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="e.g. Separate gravy, extra hot, no mayo"
              className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#e6ded3]">
            <span className="text-sm font-bold text-[#432d1e]">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-[#f5efe6] hover:bg-[#ede4d8] flex items-center justify-center text-[#432d1e] font-bold cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-lg font-black tabular-nums text-[#432d1e]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl bg-[#824618] hover:bg-[#6c3a14] flex items-center justify-center text-white font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f5f0e8] p-4 flex items-center justify-between border-t border-[#e6ded3]">
          <div>
            <span className="text-xs text-[#7a5e4b] block">Total Item Price</span>
            <span className="text-xl font-black text-[#824618] tabular-nums">
              {formatCurrency(itemTotal)}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-[#824618] hover:bg-[#6c3a14] text-white font-extrabold rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 text-sm"
          >
            Add to Current Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
