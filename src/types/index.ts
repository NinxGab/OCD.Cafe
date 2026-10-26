export type Role = 'admin' | 'cashier' | 'barista' | 'kitchen';

export type OrderStatus = 'preparing' | 'serving' | 'served';

export interface Staff {
  id: string;
  name: string;
  role: Role;
  pin: string; // 4-digit PIN for quick tablet terminal access
  password?: string; // full password for admin remote login
  shiftStatus: 'clocked_in' | 'clocked_out' | 'break';
  clockInTime?: string;
  totalSales: number;
  ordersProcessed: number;
  joinedAt: string;
}

export interface ProductSizeOption {
  name: string; // e.g. "8oz", "12oz", "16oz", "22oz", "Solo", "Barkada"
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: 'rice_meals' | 'burgers' | 'sandwiches' | 'pizza' | 'snacks' | 'espresso' | 'iced_drinks' | 'shakes' | 'frappes' | 'milk_tea';
  basePrice: number;
  sizes?: ProductSizeOption[];
  isAvailable: boolean;
  description?: string;
}

export interface OrderItemModifier {
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize?: ProductSizeOption;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
  modifiers?: OrderItemModifier[];
  notes?: string;
}

export interface PaymentDetails {
  method: 'cash' | 'gcash' | 'card';
  amountTendered?: number;
  change?: number;
  referenceNumber?: string;
  cardLast4?: string;
  authCode?: string;
}

export interface Order {
  id: string;
  receiptNumber: string;
  customerNumber: number; // Customer 1 to 30
  timestamp: string;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discountType: 'none' | 'senior' | 'pwd' | 'special';
  discountPercentage: number;
  discountAmount: number;
  total: number;
  payment: PaymentDetails;
  status: 'completed' | 'voided';
  fulfillmentStatus: OrderStatus; // 'preparing' | 'serving' | 'served'
  syncStatus: 'synced' | 'pending_sync';
  transactionHash: string;
  encryptedToken: string;
  offlineCreated?: boolean;
}

export interface ShiftSchedule {
  id: string;
  staffId: string;
  staffName: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  shiftType: 'morning' | 'mid' | 'evening' | 'off';
  startTime: string;
  endTime: string;
  notes?: string;
}
