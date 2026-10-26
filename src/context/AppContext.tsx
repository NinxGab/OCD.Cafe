import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, Staff, ShiftSchedule, Order, CartItem, ProductSizeOption, OrderStatus } from '../types';
import { INITIAL_STAFF, INITIAL_PRODUCTS, INITIAL_SHIFTS } from '../data/initialData';
import { generateTransactionSignature, generateReceiptNumber } from '../utils/crypto';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

interface AppContextType {
  // Navigation & View
  activeView: 'pos' | 'orders' | 'dashboard' | 'products' | 'reports' | 'staff' | 'schedule';
  setActiveView: (view: 'pos' | 'orders' | 'dashboard' | 'products' | 'reports' | 'staff' | 'schedule') => void;
  isTabletMode: boolean;
  setIsTabletMode: (val: boolean) => void;

  // Staff & Auth
  staffList: Staff[];
  currentStaff: Staff | null;
  setCurrentStaff: (staff: Staff | null) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  loginWithPin: (pin: string) => boolean;
  loginWithPassword: (name: string, pass: string) => boolean;
  clockInOutStaff: (staffId: string) => void;
  addStaff: (staff: Omit<Staff, 'id' | 'totalSales' | 'ordersProcessed' | 'joinedAt'>) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  removeStaff: (id: string) => void;
  changeStaffPinOrPassword: (staffId: string, newPin: string, newPassword?: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart & POS
  cart: CartItem[];
  customerNumber: number; // 1 to 30
  setCustomerNumber: (num: number) => void;
  addToCart: (product: Product, selectedSize?: ProductSizeOption, quantity?: number, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  discountType: 'none' | 'senior' | 'pwd' | 'special';
  setDiscountType: (type: 'none' | 'senior' | 'pwd' | 'special') => void;
  customDiscountPct: number;
  setCustomDiscountPct: (pct: number) => void;
  cartSubtotal: number;
  cartDiscountAmount: number;
  cartTotal: number;

  // Checkout & Order Status Panel (Preparing -> Serving -> Served)
  processCheckout: (payment: {
    method: 'cash' | 'gcash' | 'card';
    amountTendered?: number;
    referenceNumber?: string;
    cardLast4?: string;
  }) => Promise<Order>;

  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingSyncCount: number;
  syncOfflineData: () => Promise<void>;
  lastOrderCompleted: Order | null;
  setLastOrderCompleted: (order: Order | null) => void;

  // Staff Schedule
  shifts: ShiftSchedule[];
  updateShift: (id: string, updates: Partial<ShiftSchedule>) => void;
  addShift: (shift: Omit<ShiftSchedule, 'id'>) => void;
  deleteShift: (id: string) => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Backup & Restore
  exportBackupData: () => void;
  importBackupData: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const STORAGE_KEYS = {
  STAFF: 'ocd_cafe_staff_v4',
  CURRENT_STAFF_ID: 'ocd_cafe_current_staff_id_v4',
  IS_LOCKED: 'ocd_cafe_is_locked_v4',
  PRODUCTS: 'ocd_cafe_products_v4',
  ORDERS: 'ocd_cafe_orders_v4',
  SHIFTS: 'ocd_cafe_shifts_v4',
  CART: 'ocd_cafe_cart_v4',
  CUSTOMER_NUM: 'ocd_cafe_customer_num_v4',
  ACTIVE_VIEW: 'ocd_cafe_active_view_v4',
  DISCOUNT_TYPE: 'ocd_cafe_discount_type_v4',
  DISCOUNT_PCT: 'ocd_cafe_discount_pct_v4',
  TABLET_MODE: 'ocd_cafe_tablet_mode_v4',
};

// Safe storage writer that catches quota or serialization issues
function safeSetStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write to localStorage for key ${key}:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Mode - Restored from localStorage
  const [activeView, setActiveViewRaw] = useState<'pos' | 'orders' | 'dashboard' | 'products' | 'reports' | 'staff' | 'schedule'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
      if (saved && ['pos', 'orders', 'dashboard', 'products', 'reports', 'staff', 'schedule'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'pos';
  });

  const setActiveView = useCallback((view: 'pos' | 'orders' | 'dashboard' | 'products' | 'reports' | 'staff' | 'schedule') => {
    setActiveViewRaw(view);
    safeSetStorage(STORAGE_KEYS.ACTIVE_VIEW, view);
  }, []);

  const [isTabletMode, setIsTabletModeRaw] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLET_MODE);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const setIsTabletMode = useCallback((val: boolean) => {
    setIsTabletModeRaw(val);
    safeSetStorage(STORAGE_KEYS.TABLET_MODE, val);
  }, []);

  // Network State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Load or initialize Staff
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_STAFF;
  });

  // Remember active logged-in staff
  const [currentStaff, setCurrentStaffRaw] = useState<Staff | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF_ID);
      if (savedId) {
        const found = staffList.find(s => s.id === savedId);
        if (found) return found;
      }
    } catch {}
    return staffList[0] || null;
  });

  const setCurrentStaff = useCallback((staff: Staff | null) => {
    setCurrentStaffRaw(staff);
    if (staff) {
      safeSetStorage(STORAGE_KEYS.CURRENT_STAFF_ID, staff.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF_ID);
    }
  }, []);

  // Remember lock state
  const [isLocked, setIsLockedRaw] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_LOCKED);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return false;
  });

  const setIsLocked = useCallback((locked: boolean) => {
    setIsLockedRaw(locked);
    safeSetStorage(STORAGE_KEYS.IS_LOCKED, locked);
  }, []);

  // Load or initialize Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  // Load or initialize Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Load or initialize Shifts
  const [shifts, setShifts] = useState<ShiftSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIFTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SHIFTS;
  });

  // Customer Number (1 to 30) - Persistent across refresh/logout
  const [customerNumber, setCustomerNumberRaw] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_NUM);
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 1 && num <= 30) return num;
      }
    } catch {}
    return 1;
  });

  const setCustomerNumber = useCallback((num: number) => {
    const clamped = Math.max(1, Math.min(30, num));
    setCustomerNumberRaw(clamped);
    safeSetStorage(STORAGE_KEYS.CUSTOMER_NUM, clamped.toString());
  }, []);

  // Active Cart - Persistent across reload/logout
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Discount Selection - Persistent across reload
  const [discountType, setDiscountTypeRaw] = useState<'none' | 'senior' | 'pwd' | 'special'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNT_TYPE);
      if (saved && ['none', 'senior', 'pwd', 'special'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'none';
  });

  const setDiscountType = useCallback((type: 'none' | 'senior' | 'pwd' | 'special') => {
    setDiscountTypeRaw(type);
    safeSetStorage(STORAGE_KEYS.DISCOUNT_TYPE, type);
  }, []);

  const [customDiscountPct, setCustomDiscountPctRaw] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCOUNT_PCT);
      if (saved) return Number(saved) || 10;
    } catch {}
    return 10;
  });

  const setCustomDiscountPct = useCallback((pct: number) => {
    setCustomDiscountPctRaw(pct);
    safeSetStorage(STORAGE_KEYS.DISCOUNT_PCT, pct.toString());
  }, []);

  const [lastOrderCompleted, setLastOrderCompleted] = useState<Order | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Reactive state sync to localStorage
  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.STAFF, staffList);
  }, [staffList]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.SHIFTS, shifts);
  }, [shifts]);

  useEffect(() => {
    safeSetStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  // Window exit / pagehide flush hook to guarantee instant preservation
  const stateRef = useRef({ staffList, products, orders, shifts, cart, customerNumber, currentStaff, isLocked });
  useEffect(() => {
    stateRef.current = { staffList, products, orders, shifts, cart, customerNumber, currentStaff, isLocked };
  }, [staffList, products, orders, shifts, cart, customerNumber, currentStaff, isLocked]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const s = stateRef.current;
      safeSetStorage(STORAGE_KEYS.STAFF, s.staffList);
      safeSetStorage(STORAGE_KEYS.PRODUCTS, s.products);
      safeSetStorage(STORAGE_KEYS.ORDERS, s.orders);
      safeSetStorage(STORAGE_KEYS.SHIFTS, s.shifts);
      safeSetStorage(STORAGE_KEYS.CART, s.cart);
      safeSetStorage(STORAGE_KEYS.CUSTOMER_NUM, s.customerNumber.toString());
      safeSetStorage(STORAGE_KEYS.IS_LOCKED, s.isLocked);
      if (s.currentStaff) {
        safeSetStorage(STORAGE_KEYS.CURRENT_STAFF_ID, s.currentStaff.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connection restored! Ready to sync offline orders.', 'info');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode Active: All orders and updates are saved locally on this tablet.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const pendingSyncCount = orders.filter(o => o.syncStatus === 'pending_sync').length;

  // Auth Handlers
  const loginWithPin = (pin: string): boolean => {
    const found = staffList.find(s => s.pin === pin);
    if (found) {
      setCurrentStaff(found);
      setIsLocked(false);
      showToast(`Welcome back, ${found.name}`, 'success');
      return true;
    }
    showToast('Invalid 4-digit PIN. Please try again.', 'error');
    return false;
  };

  const loginWithPassword = (name: string, pass: string): boolean => {
    const found = staffList.find(
      s => s.name.toLowerCase() === name.toLowerCase().trim() && (s.password === pass || s.pin === pass)
    );
    if (found) {
      setCurrentStaff(found);
      setIsLocked(false);
      showToast(`Logged in successfully as ${found.name}`, 'success');
      return true;
    }
    showToast('Invalid credentials.', 'error');
    return false;
  };

  const clockInOutStaff = (staffId: string) => {
    setStaffList(prev => {
      const updated = prev.map(s => {
        if (s.id !== staffId) return s;
        const isClockingIn = s.shiftStatus !== 'clocked_in';
        const updatedStatus = isClockingIn ? 'clocked_in' : 'clocked_out';
        showToast(
          `${s.name} is now ${isClockingIn ? 'Clocked In' : 'Clocked Out'} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          'info'
        );
        return {
          ...s,
          shiftStatus: updatedStatus as any,
          clockInTime: isClockingIn ? new Date().toISOString() : undefined,
        };
      });
      safeSetStorage(STORAGE_KEYS.STAFF, updated);
      return updated;
    });
  };

  const addStaff = (newStaffData: Omit<Staff, 'id' | 'totalSales' | 'ordersProcessed' | 'joinedAt'>) => {
    const id = `staff-${Date.now().toString(36)}`;
    const newStaff: Staff = {
      ...newStaffData,
      id,
      totalSales: 0,
      ordersProcessed: 0,
      joinedAt: new Date().toISOString(),
      shiftStatus: 'clocked_out',
    };
    setStaffList(prev => {
      const updated = [...prev, newStaff];
      safeSetStorage(STORAGE_KEYS.STAFF, updated);
      return updated;
    });
    showToast(`Staff member "${newStaff.name}" added successfully!`, 'success');
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaffList(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const u = { ...s, ...updates };
          if (currentStaff?.id === id) setCurrentStaff(u);
          return u;
        }
        return s;
      });
      safeSetStorage(STORAGE_KEYS.STAFF, updated);
      return updated;
    });
    showToast('Staff details updated.', 'success');
  };

  const removeStaff = (id: string) => {
    if (staffList.length <= 1) {
      showToast('Cannot remove the last staff member.', 'error');
      return;
    }
    setStaffList(prev => {
      const updated = prev.filter(s => s.id !== id);
      safeSetStorage(STORAGE_KEYS.STAFF, updated);
      return updated;
    });
    if (currentStaff?.id === id) {
      const remaining = staffList.find(s => s.id !== id);
      setCurrentStaff(remaining || null);
    }
    showToast('Staff member removed.', 'info');
  };

  const changeStaffPinOrPassword = (staffId: string, newPin: string, newPassword?: string) => {
    setStaffList(prev => {
      const updated = prev.map(s => {
        if (s.id === staffId) {
          const u = {
            ...s,
            pin: newPin,
            password: newPassword || s.password || newPin,
          };
          if (currentStaff?.id === staffId) setCurrentStaff(u);
          return u;
        }
        return s;
      });
      safeSetStorage(STORAGE_KEYS.STAFF, updated);
      return updated;
    });
    showToast('Security PIN and password saved!', 'success');
  };

  // Product CRUD with instant persistence
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now().toString(36)}`;
    const newProduct: Product = { ...prodData, id: newId };
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      safeSetStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    showToast(`Added product "${newProduct.name}" to menu.`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...updates } : p));
      safeSetStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    showToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      safeSetStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    showToast('Product removed from catalog.', 'info');
  };

  // Cart Operations with instant persistence
  const addToCart = (product: Product, selectedSize?: ProductSizeOption, quantity = 1, notes = '') => {
    const unitPrice = selectedSize ? selectedSize.price : product.basePrice;
    const sizeKey = selectedSize ? selectedSize.name : 'standard';
    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && (item.selectedSize?.name || 'standard') === sizeKey
    );

    let updatedCart: CartItem[];
    if (existingIndex >= 0) {
      updatedCart = [...cart];
      const item = updatedCart[existingIndex];
      const newQty = item.quantity + quantity;
      updatedCart[existingIndex] = {
        ...item,
        quantity: newQty,
        itemSubtotal: item.unitPrice * newQty,
        notes: notes || item.notes,
      };
    } else {
      const newItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        product,
        selectedSize,
        quantity,
        unitPrice,
        itemSubtotal: unitPrice * quantity,
        notes,
      };
      updatedCart = [...cart, newItem];
    }
    setCart(updatedCart);
    safeSetStorage(STORAGE_KEYS.CART, updatedCart);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => {
      const updated = prev.filter(c => c.cartItemId !== cartItemId);
      safeSetStorage(STORAGE_KEYS.CART, updated);
      return updated;
    });
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => {
      const updated = prev.map(c => {
        if (c.cartItemId === cartItemId) {
          return {
            ...c,
            quantity: newQty,
            itemSubtotal: c.unitPrice * newQty,
          };
        }
        return c;
      });
      safeSetStorage(STORAGE_KEYS.CART, updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountType('none');
    localStorage.removeItem(STORAGE_KEYS.CART);
  };

  // Cart Calculations - NO VAT TAX
  const cartSubtotal = cart.reduce((acc, it) => acc + it.itemSubtotal, 0);

  let cartDiscountPercentage = 0;
  if (discountType === 'senior' || discountType === 'pwd') {
    cartDiscountPercentage = 20; // 20% Senior / PWD
  } else if (discountType === 'special') {
    cartDiscountPercentage = customDiscountPct;
  }

  const cartDiscountAmount = Math.round(cartSubtotal * (cartDiscountPercentage / 100));
  const cartTotal = Math.max(0, cartSubtotal - cartDiscountAmount);

  // Process Checkout with instant disk persistence
  const processCheckout = async (payment: {
    method: 'cash' | 'gcash' | 'card';
    amountTendered?: number;
    referenceNumber?: string;
    cardLast4?: string;
  }): Promise<Order> => {
    if (cart.length === 0) throw new Error('Cart is empty');
    if (!currentStaff) throw new Error('No active cashier signed in');

    const receiptNumber = generateReceiptNumber();
    const timestamp = new Date().toISOString();

    const { transactionHash, encryptedToken } = await generateTransactionSignature({
      receiptNumber,
      timestamp,
      total: cartTotal,
      cashierId: currentStaff.id,
    });

    const change = payment.method === 'cash' && payment.amountTendered ? Math.max(0, payment.amountTendered - cartTotal) : 0;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      receiptNumber,
      customerNumber,
      timestamp,
      cashierId: currentStaff.id,
      cashierName: currentStaff.name,
      items: [...cart],
      subtotal: cartSubtotal,
      discountType,
      discountPercentage: cartDiscountPercentage,
      discountAmount: cartDiscountAmount,
      total: cartTotal,
      payment: {
        method: payment.method,
        amountTendered: payment.amountTendered,
        change,
        referenceNumber: payment.referenceNumber,
        cardLast4: payment.cardLast4,
        authCode: payment.method === 'card' ? `AUTH_${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      },
      status: 'completed',
      fulfillmentStatus: 'preparing',
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      transactionHash,
      encryptedToken,
      offlineCreated: !isOnline,
    };

    // 1. Update and synchronously persist staff sales
    const updatedStaff = staffList.map(s => {
      if (s.id === currentStaff.id) {
        return {
          ...s,
          totalSales: s.totalSales + cartTotal,
          ordersProcessed: s.ordersProcessed + 1,
        };
      }
      return s;
    });
    setStaffList(updatedStaff);
    safeSetStorage(STORAGE_KEYS.STAFF, updatedStaff);

    // 2. Synchronously persist new order list
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    safeSetStorage(STORAGE_KEYS.ORDERS, updatedOrders);

    setLastOrderCompleted(newOrder);
    clearCart();

    // 3. Increment and persist next customer number (1-30)
    const nextCustNum = customerNumber >= 30 ? 1 : customerNumber + 1;
    setCustomerNumber(nextCustNum);

    showToast(`Order for Customer #${customerNumber} recorded and saved!`, 'success');
    return newOrder;
  };

  // Update fulfillment status with instant persistence
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          return { ...o, fulfillmentStatus: newStatus };
        }
        return o;
      });
      safeSetStorage(STORAGE_KEYS.ORDERS, updated);
      return updated;
    });

    const statusLabels: Record<OrderStatus, string> = {
      preparing: 'Preparing in Kitchen',
      serving: 'Now Serving at Counter',
      served: 'Claimed by Customer (Served)',
    };
    showToast(`Order updated: ${statusLabels[newStatus]}`, 'info');
  };

  // Cloud Sync
  const syncOfflineData = async () => {
    const pendingOrders = orders.filter(o => o.syncStatus === 'pending_sync');
    if (pendingOrders.length === 0) {
      showToast('All transaction records are synced.', 'info');
      return;
    }

    await new Promise(res => setTimeout(res, 600));
    setOrders(prev => {
      const updated = prev.map(o => (o.syncStatus === 'pending_sync' ? { ...o, syncStatus: 'synced' as const } : o));
      safeSetStorage(STORAGE_KEYS.ORDERS, updated);
      return updated;
    });
    showToast(`Successfully synced ${pendingOrders.length} offline orders!`, 'success');
  };

  // Shift Schedule operations with instant persistence
  const updateShift = (id: string, updates: Partial<ShiftSchedule>) => {
    setShifts(prev => {
      const updated = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
      safeSetStorage(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    });
    showToast('Shift schedule updated.', 'success');
  };

  const addShift = (shiftData: Omit<ShiftSchedule, 'id'>) => {
    const id = `shift-${Date.now().toString(36)}`;
    setShifts(prev => {
      const updated = [...prev, { ...shiftData, id }];
      safeSetStorage(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    });
    showToast('Scheduled new staff shift.', 'success');
  };

  const deleteShift = (id: string) => {
    setShifts(prev => {
      const updated = prev.filter(s => s.id !== id);
      safeSetStorage(STORAGE_KEYS.SHIFTS, updated);
      return updated;
    });
    showToast('Shift removed from schedule.', 'info');
  };

  // Full Data Backup Export
  const exportBackupData = () => {
    try {
      const backupPayload = {
        version: '4.0',
        timestamp: new Date().toISOString(),
        staffList,
        products,
        orders,
        shifts,
        customerNumber,
      };
      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ocd_cafe_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('All cafe data successfully exported to backup file!', 'success');
    } catch (e) {
      showToast('Failed to export backup data.', 'error');
    }
  };

  // Full Data Backup Restore
  const importBackupData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.staffList && Array.isArray(parsed.staffList)) {
        setStaffList(parsed.staffList);
        safeSetStorage(STORAGE_KEYS.STAFF, parsed.staffList);
      }
      if (parsed.products && Array.isArray(parsed.products)) {
        setProducts(parsed.products);
        safeSetStorage(STORAGE_KEYS.PRODUCTS, parsed.products);
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
        safeSetStorage(STORAGE_KEYS.ORDERS, parsed.orders);
      }
      if (parsed.shifts && Array.isArray(parsed.shifts)) {
        setShifts(parsed.shifts);
        safeSetStorage(STORAGE_KEYS.SHIFTS, parsed.shifts);
      }
      if (typeof parsed.customerNumber === 'number') {
        setCustomerNumber(parsed.customerNumber);
      }
      showToast('Cafe database successfully restored from backup!', 'success');
      return true;
    } catch (e) {
      showToast('Invalid backup file. Please provide a valid JSON backup.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        isTabletMode,
        setIsTabletMode,
        staffList,
        currentStaff,
        setCurrentStaff,
        isLocked,
        setIsLocked,
        loginWithPin,
        loginWithPassword,
        clockInOutStaff,
        addStaff,
        updateStaff,
        removeStaff,
        changeStaffPinOrPassword,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
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
        setCustomDiscountPct,
        cartSubtotal,
        cartDiscountAmount,
        cartTotal,
        processCheckout,
        orders,
        updateOrderStatus,
        isOnline,
        setIsOnline,
        pendingSyncCount,
        syncOfflineData,
        lastOrderCompleted,
        setLastOrderCompleted,
        shifts,
        updateShift,
        addShift,
        deleteShift,
        toasts,
        showToast,
        removeToast,
        exportBackupData,
        importBackupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
