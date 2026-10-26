import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductSizeOption } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { SizeSelectorModal } from './SizeSelectorModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Utensils,
  ArrowRight,
  User,
  Users,
  Check
} from 'lucide-react';

export const PosTerminal: React.FC = () => {
  const {
    products,
    cart,
    customerNumber,
    setCustomerNumber,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    discountType,
    setDiscountType,
    customDiscountPct,
    cartSubtotal,
    cartDiscountAmount,
    cartTotal,
    currentStaff,
    lastOrderCompleted,
    setLastOrderCompleted,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'rice_meals', label: 'Rice Meals' },
    { id: 'burgers', label: 'Burgers & Sliders' },
    { id: 'sandwiches', label: 'Sandwiches' },
    { id: 'pizza', label: 'Pizza' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'espresso', label: 'Espresso (Hot)' },
    { id: 'iced_drinks', label: 'Iced Drinks' },
    { id: 'frappes', label: 'Frappes & Shakes' },
    { id: 'milk_tea', label: 'Milk Teas' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && p.isAvailable;
    });
  }, [products, activeCategory, searchQuery]);

  const handleProductCardClick = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProductForModal(product);
    } else {
      addToCart(product);
    }
  };

  const handleModalConfirm = (
    selectedSize: ProductSizeOption | undefined,
    quantity: number,
    notes: string
  ) => {
    if (selectedProductForModal) {
      addToCart(selectedProductForModal, selectedSize, quantity, notes);
      setSelectedProductForModal(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#faf8f5]">
      {/* LEFT: Catalog Section */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#e6ded3]">
        {/* Search & Category Filter Toolbar */}
        <div className="p-3 sm:p-4 bg-[#fdfcfb] border-b border-[#e6ded3] space-y-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a5e4b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search food, coffee, milk tea, combo..."
                className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6ded3] rounded-xl text-xs sm:text-sm text-[#432d1e] placeholder-[#7a5e4b] focus:outline-none focus:ring-2 focus:ring-[#824618]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7a5e4b] hover:text-[#432d1e]"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-xs text-[#7a5e4b] font-medium hidden sm:block whitespace-nowrap">
              Showing <span className="font-bold text-[#824618]">{filteredProducts.length}</span> items
            </div>
          </div>

          {/* Horizontal Category Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-[#824618] text-white shadow-xs'
                      : 'bg-white text-[#593c28] border border-[#e6ded3] hover:bg-[#f5efe6]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7a5e4b]">
              <Utensils className="w-12 h-12 text-[#dfd4c4] mb-2" />
              <p className="font-bold text-base text-[#432d1e]">No items found</p>
              <p className="text-xs">Try selecting another category or clearing your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                return (
                  <button
                    key={product.id}
                    onClick={() => handleProductCardClick(product)}
                    className="p-3 sm:p-3.5 rounded-2xl border border-[#e6ded3] bg-white hover:border-[#824618] hover:shadow-sm text-left flex flex-col justify-between transition-all select-none cursor-pointer active:scale-97 min-h-[105px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#824618] truncate">
                          {product.category}
                        </span>
                        {product.sizes && product.sizes.length > 0 && (
                          <span className="text-[9px] font-bold bg-[#f5efe6] text-[#7a5e4b] px-1.5 py-0.5 rounded shrink-0">
                            {product.sizes.length} Sizes
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-[#432d1e] line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#f5efe6] flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-[#824618] tabular-nums">
                        {product.sizes && product.sizes.length > 0
                          ? `from ${formatCurrency(product.sizes[0].price)}`
                          : formatCurrency(product.basePrice)}
                      </span>

                      <div className="w-7 h-7 rounded-lg bg-[#f5efe6] text-[#824618] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#824618] group-hover:text-white">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Tablet Cart with Customer Number 1 to 30 */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white flex flex-col h-full shadow-md border-t lg:border-t-0 shrink-0">
        {/* Cart Header with Customer 1-30 Switcher */}
        <div className="p-3.5 bg-[#f5f0e8] border-b border-[#e6ded3] space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#824618]" />
              <div>
                <h3 className="font-black text-sm text-[#432d1e]">Current Ticket</h3>
                <p className="text-[11px] text-[#7a5e4b]">
                  Cashier: {currentStaff?.name || 'Kuya Nats'}
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-[#7a5e4b] hover:text-red-600 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Customer Number (1 to 30) Selector */}
          <div className="bg-white p-2.5 rounded-xl border border-[#e6ded3] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#824618] text-white flex items-center justify-center font-black text-sm">
                {customerNumber}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7a5e4b] block leading-none">
                  Assigned Customer / Table
                </span>
                <span className="text-sm font-extrabold text-[#432d1e]">
                  Customer #{customerNumber}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCustomerPicker(!showCustomerPicker)}
              className="px-2.5 py-1 bg-[#f5efe6] hover:bg-[#ede4d8] text-[#824618] rounded-lg text-xs font-bold border border-[#e6ded3] cursor-pointer"
            >
              Change (1-30)
            </button>
          </div>

          {/* Customer 1 to 30 Dropdown Panel */}
          {showCustomerPicker && (
            <div className="bg-white p-3 rounded-xl border border-[#dec7b7] shadow-lg animate-in fade-in space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#432d1e]">
                <span>Select Customer Number (1 to 30):</span>
                <button
                  onClick={() => setShowCustomerPicker(false)}
                  className="text-[#7a5e4b] hover:text-[#432d1e] text-[11px]"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto p-1">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setCustomerNumber(num);
                      setShowCustomerPicker(false);
                    }}
                    className={`h-8 rounded-lg font-black text-xs cursor-pointer transition-all ${
                      customerNumber === num
                        ? 'bg-[#824618] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#593c28] border border-[#e6ded3] hover:bg-[#ede4d8]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#faf8f5]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7a5e4b]">
              <div className="w-14 h-14 rounded-full bg-[#f5efe6] flex items-center justify-center mb-2">
                <ShoppingCart className="w-6 h-6 text-[#7a5e4b]" />
              </div>
              <p className="font-bold text-sm text-[#432d1e]">Ticket is Empty</p>
              <p className="text-xs max-w-xs mt-1">
                Select items from the catalog for Customer #{customerNumber}.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.cartItemId}
                className="bg-white p-3 rounded-xl border border-[#e6ded3] shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-bold text-xs sm:text-sm text-[#432d1e]">
                      {item.product.name}
                    </h5>
                    {item.selectedSize && (
                      <span className="text-[11px] font-semibold text-[#824618] block">
                        Size: {item.selectedSize.name}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-[10px] text-[#7a5e4b] italic block">
                        Note: {item.notes}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-sm text-[#432d1e] tabular-nums shrink-0">
                    {formatCurrency(item.itemSubtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#f5efe6]">
                  <span className="text-xs text-[#7a5e4b] tabular-nums">
                    {formatCurrency(item.unitPrice)} each
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-[#f5efe6] hover:bg-[#ede4d8] text-[#432d1e] font-bold flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-[#824618] hover:bg-[#6c3a14] text-white font-bold flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discount & Totals Section - NO VAT TAX */}
        <div className="p-3.5 bg-[#fdfcfb] border-t border-[#e6ded3] space-y-2.5 shrink-0">
          {/* Quick Discount Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setDiscountType('none')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border cursor-pointer ${
                discountType === 'none'
                  ? 'bg-[#432d1e] text-white border-[#432d1e]'
                  : 'bg-white text-[#593c28] border-[#e6ded3]'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setDiscountType('senior')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border cursor-pointer ${
                discountType === 'senior'
                  ? 'bg-[#824618] text-white border-[#824618]'
                  : 'bg-white text-[#593c28] border-[#e6ded3]'
              }`}
            >
              Senior (20%)
            </button>
            <button
              onClick={() => setDiscountType('pwd')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border cursor-pointer ${
                discountType === 'pwd'
                  ? 'bg-[#824618] text-white border-[#824618]'
                  : 'bg-white text-[#593c28] border-[#e6ded3]'
              }`}
            >
              PWD (20%)
            </button>
            <button
              onClick={() => setDiscountType('special')}
              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border cursor-pointer ${
                discountType === 'special'
                  ? 'bg-[#d97706] text-white border-[#d97706]'
                  : 'bg-white text-[#593c28] border-[#e6ded3]'
              }`}
            >
              Promo {customDiscountPct}%
            </button>
          </div>

          {/* Numbers breakdown - NO VAT TAX */}
          <div className="space-y-1 text-xs text-[#593c28]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold tabular-nums">{formatCurrency(cartSubtotal)}</span>
            </div>
            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Discount Applied:</span>
                <span className="tabular-nums">-{formatCurrency(cartDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-[#432d1e] pt-1.5 border-t border-[#f5efe6]">
              <span>TOTAL PAYABLE:</span>
              <span className="text-xl text-[#824618] tabular-nums">
                {formatCurrency(cartTotal)}
              </span>
            </div>
          </div>

          {/* Charge / Checkout Button */}
          <button
            onClick={() => setShowCheckoutModal(true)}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-97 ${
              cart.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-[#824618] hover:bg-[#6c3a14] text-white'
            }`}
          >
            <span>Charge Customer #{customerNumber} · {formatCurrency(cartTotal)}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedProductForModal && (
        <SizeSelectorModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}

      {showCheckoutModal && (
        <CheckoutModal
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => setShowCheckoutModal(false)}
        />
      )}

      {lastOrderCompleted && (
        <ReceiptModal
          order={lastOrderCompleted}
          onClose={() => setLastOrderCompleted(null)}
        />
      )}
    </div>
  );
};
