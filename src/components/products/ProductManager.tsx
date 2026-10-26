import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductSizeOption } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X
} from 'lucide-react';

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form states for creating / editing - without stocks or expenses
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    categoryId: Product['categoryId'];
    basePrice: number;
    isAvailable: boolean;
    description: string;
    sizes: ProductSizeOption[];
  }>({
    name: '',
    category: 'Rice Meals',
    categoryId: 'rice_meals',
    basePrice: 85,
    isAvailable: true,
    description: '',
    sizes: [],
  });

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

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      category: 'Rice Meals',
      categoryId: 'rice_meals',
      basePrice: 85,
      isAvailable: true,
      description: '',
      sizes: [],
    });
    setIsCreatingNew(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      categoryId: p.categoryId,
      basePrice: p.basePrice,
      isAvailable: p.isAvailable,
      description: p.description || '',
      sizes: p.sizes ? [...p.sizes] : [],
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isCreatingNew) {
      addProduct({
        name: formData.name.trim(),
        category: formData.category,
        categoryId: formData.categoryId,
        basePrice: Number(formData.basePrice),
        isAvailable: formData.isAvailable,
        description: formData.description.trim(),
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      });
      setIsCreatingNew(false);
    } else if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        category: formData.category,
        categoryId: formData.categoryId,
        basePrice: Number(formData.basePrice),
        isAvailable: formData.isAvailable,
        description: formData.description.trim(),
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      });
      setEditingProduct(null);
    }
  };

  const handleAddSizeVariant = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '16oz', price: prev.basePrice + 20 }],
    }));
  };

  const handleRemoveSizeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSizeVariant = (index: number, key: keyof ProductSizeOption, value: string | number) => {
    setFormData(prev => {
      const updated = [...prev.sizes];
      updated[index] = {
        ...updated[index],
        [key]: value,
      };
      return { ...prev, sizes: updated };
    });
  };

  return (
    <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#432d1e] flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#824618]" />
            <span>Product Catalog &amp; Menu Prices</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7a5e4b]">
            Add items, edit menu prices, setup size variants, or remove dishes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#824618] hover:bg-[#6c3a14] text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#e6ded3] space-y-3 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a5e4b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full pl-9 pr-3 py-2 bg-[#faf8f5] border border-[#e6ded3] rounded-xl text-xs sm:text-sm text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#824618] text-white shadow-xs'
                    : 'bg-[#faf8f5] text-[#593c28] hover:bg-[#f5efe6]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table (without stocks or expenses) */}
      <div className="bg-white rounded-2xl border border-[#e6ded3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f0e8] text-[#432d1e] uppercase tracking-wider text-[11px] border-b border-[#e6ded3]">
              <tr>
                <th className="py-3.5 px-4 font-black">Product Name</th>
                <th className="py-3.5 px-3 font-black">Category</th>
                <th className="py-3.5 px-3 text-right font-black">Price</th>
                <th className="py-3.5 px-3 text-center font-black">Sizes / Variants</th>
                <th className="py-3.5 px-3 text-center font-black">POS Availability</th>
                <th className="py-3.5 px-4 text-center font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe6]">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#432d1e] text-sm">
                    {p.name}
                    {p.description && (
                      <span className="block text-[11px] font-normal text-[#7a5e4b] truncate max-w-xs">
                        {p.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-[#593c28] font-semibold">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-[#824618] text-sm tabular-nums">
                    {p.sizes && p.sizes.length > 0
                      ? `${formatCurrency(p.sizes[0].price)} - ${formatCurrency(p.sizes[p.sizes.length - 1].price)}`
                      : formatCurrency(p.basePrice)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {p.sizes && p.sizes.length > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f5efe6] text-[#7a5e4b] font-bold text-[10px]">
                        {p.sizes.map(s => s.name).join(' · ')}
                      </span>
                    ) : (
                      <span className="text-[#7a5e4b] text-[11px]">Regular</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        p.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {p.isAvailable ? 'Active in POS' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-[#824618] hover:bg-[#824618]/10 rounded-lg cursor-pointer"
                        title="Edit product & price"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {(isCreatingNew || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-[#faf8f5] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#e6ded3] flex flex-col max-h-[90vh]"
          >
            <div className="bg-[#f5f0e8] text-[#432d1e] p-4 flex items-center justify-between border-b border-[#e6ded3]">
              <div>
                <h3 className="font-black text-base">
                  {isCreatingNew ? 'Add New Product to Menu' : `Edit "${editingProduct?.name}"`}
                </h3>
                <p className="text-xs text-[#7a5e4b]">
                  Set item prices and size variants
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-lg text-[#7a5e4b] hover:text-[#432d1e] hover:bg-[#ede4d8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Garlic Butter Chicken Wings"
                  className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm text-[#432d1e] font-semibold focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={e => {
                      const catId = e.target.value as Product['categoryId'];
                      const found = categories.find(c => c.id === catId);
                      setFormData({
                        ...formData,
                        categoryId: catId,
                        category: found ? found.label : 'General',
                      });
                    }}
                    className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-xs text-[#432d1e] focus:outline-none focus:ring-2 focus:ring-[#824618]/50"
                  >
                    <option value="rice_meals">Rice Meals</option>
                    <option value="burgers">Burgers &amp; Sliders</option>
                    <option value="sandwiches">Sandwiches</option>
                    <option value="pizza">Pizza</option>
                    <option value="snacks">Snacks</option>
                    <option value="espresso">Espresso (Hot)</option>
                    <option value="iced_drinks">Iced Drinks</option>
                    <option value="frappes">Frappes &amp; Shakes</option>
                    <option value="milk_tea">Milk Teas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                    Selling Price (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-sm font-black text-[#824618]"
                  />
                </div>
              </div>

              {/* Multi-Size Variants */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#e6ded3] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#593c28] uppercase">
                      Size &amp; Portion Variants
                    </span>
                    <p className="text-[11px] text-[#7a5e4b]">
                      e.g. 8oz, 12oz, 16oz, 22oz, or Solo / Barkada
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeVariant}
                    className="px-2.5 py-1 bg-[#f5efe6] hover:bg-[#824618] hover:text-white rounded-lg text-xs font-bold text-[#593c28] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                {formData.sizes.length > 0 && (
                  <div className="space-y-2">
                    {formData.sizes.map((sz, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={sz.name}
                          onChange={e => handleUpdateSizeVariant(idx, 'name', e.target.value)}
                          placeholder="Size (e.g. 16oz)"
                          className="w-28 bg-[#faf8f5] border border-[#e6ded3] rounded-lg px-2.5 py-1.5 text-xs text-[#432d1e] font-bold"
                        />
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1.5 text-[10px] text-[#7a5e4b]">₱</span>
                          <input
                            type="number"
                            value={sz.price}
                            onChange={e => handleUpdateSizeVariant(idx, 'price', Number(e.target.value))}
                            placeholder="Price"
                            className="w-full pl-6 pr-2 py-1.5 bg-[#faf8f5] border border-[#e6ded3] rounded-lg text-xs font-black text-[#824618]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeVariant(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#593c28] uppercase mb-1">
                  Menu Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, preparation details..."
                  className="w-full bg-white border border-[#e6ded3] rounded-xl px-3 py-2 text-xs text-[#432d1e]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prod-available"
                  checked={formData.isAvailable}
                  onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-[#824618] rounded border-[#e6ded3]"
                />
                <label htmlFor="prod-available" className="text-xs font-bold text-[#432d1e] cursor-pointer">
                  Available for ordering on POS tablet terminal
                </label>
              </div>
            </div>

            <div className="bg-[#f5f0e8] p-4 flex items-center justify-between border-t border-[#e6ded3]">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 bg-white rounded-xl border border-[#e6ded3] text-xs font-bold text-[#593c28] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#824618] hover:bg-[#6c3a14] text-white text-xs font-extrabold rounded-xl cursor-pointer shadow-xs"
              >
                {isCreatingNew ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#432d1e]">Remove Product?</h3>
              <p className="text-xs text-[#7a5e4b] mt-1">
                Are you sure you want to remove <strong>{productToDelete.name}</strong> from the menu?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 bg-[#f5efe6] rounded-xl text-xs font-bold text-[#432d1e] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
