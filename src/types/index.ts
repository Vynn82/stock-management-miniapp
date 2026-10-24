export interface ProductVariant {
  id: string;
  code: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  image?: string | null;
  stock?: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  image?: string | null;
  images?: string[];
  description?: string;
  category?: {
    id: string;
    name: string;
    code: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  variants?: ProductVariant[];
  totalStock?: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  isActive?: boolean;
}

export interface CartItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  productCode: string;
  price: number;
  image?: string | null;
  quantity: number;
}

export type CustomerOrderStatus =
  | "PENDING_REVIEW"
  | "WAITING_CUSTOMER"
  | "CONFIRMED"
  | "WAITING_STOCK"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type DeliveryStatus = "PENDING" | "OUT_FOR_DELIVERY" | "DELIVERED";
export type PaymentStatus = "UNPAID" | "PAID";

export interface CustomerOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  warehouseId: string | null;
  requestedQuantity: number;
  approvedQuantity: number;
  waitingQuantity: number;
  unitPrice: number;
  status: string;
  product?: {
    id: string;
    name: string;
    code: string;
    image?: string | null;
  };
  variant?: {
    id: string;
    name: string;
    code: string;
    image?: string | null;
  } | null;
}

export interface CustomerOrderMessage {
  id: string;
  orderId: string;
  senderType: "CUSTOMER" | "STAFF" | "SYSTEM";
  senderId: string | null;
  senderName: string | null;
  message: string;
  messageType: "TEXT" | "QUESTION" | "RESPONSE" | "STATUS_UPDATE";
  metadata?: {
    proposedQuantity?: number;
    itemId?: string;
  } | null;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNo: string;
  customerId: string;
  telegramUserId: string;
  telegramChatId: string | null;
  status: CustomerOrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "CASH";
  totalAmount: number;
  deliveryAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string | null;
    companyName: string | null;
    telegramUsername: string | null;
  };
  items: CustomerOrderItem[];
  messages?: CustomerOrderMessage[];
}


export type CustomerAuthStatus =
  | 'REGISTRATION_REQUIRED'
  | 'PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'BLOCKED';

export interface LocationData {
  address: string;
  latitude: number | null;
  longitude: number | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
}

export interface GeocodeResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
}

export interface LocationSearchResult {
  displayName: string;
  latitude: number;
  longitude: number;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
}

export interface CustomerProfile {
  id: string;
  companyName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  province?: string | null;
  district?: string | null;
  commune?: string | null;
  status: CustomerAuthStatus;
  rejectionReason?: string | null;
  telegramUserId?: string;
  telegramUsername?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface CustomerAuthResponse {
  status: CustomerAuthStatus;
  accessToken?: string;
  message?: string;
  rejectionReason?: string;
  telegramUser?: {
    id: number;
    firstName: string;
    lastName?: string | null;
    username?: string | null;
  };
  customer?: CustomerProfile;
}

