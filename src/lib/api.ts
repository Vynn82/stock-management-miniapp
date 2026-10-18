import {
  Category,
  CustomerAuthResponse,
  CustomerOrder,
  CustomerProfile,
  Product,
} from '@/types';

export function getApiBaseUrl(): string {
  // In the browser, always route through the Next.js same-origin rewrite proxy (/api-backend).
  // This completely eliminates "Not allowed by CORS" and HTTPS Mixed Content blocks.
  if (typeof window !== 'undefined') {
    return '/api-backend';
  }
  // Server-side (Node.js / SSR)
  return (
    process.env.BACKEND_API_URL ||
    (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('/')
      ? process.env.NEXT_PUBLIC_API_URL
      : 'http://54.151.147.75:3000')
  );
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('tg_customer_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.message || (Array.isArray(data?.message) ? data.message.join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data as T;
}

interface RawStock {
  quantity?: number | string | null;
}

interface RawVariant {
  id: string;
  code: string;
  name: string;
  sku?: string | null;
  price?: number | string | null;
  sellingPrice?: number | string | null;
  image?: string | null;
  stocks?: RawStock[];
}

interface RawProduct {
  id: string;
  code: string;
  name: string;
  price?: number | string | null;
  sellingPrice?: number | string | null;
  image?: string | null;
  images?: string[];
  description?: string | null;
  category?: { id: string; name: string; code: string };
  brand?: { id: string; name: string };
  variants?: RawVariant[];
  stocks?: RawStock[];
  totalStock?: number | string;
  isActive?: boolean;
}

interface RawCategory {
  id: string;
  name: string;
  code: string;
  isActive?: boolean;
}

interface PaginatedApiResponse<T> {
  data?: T[];
  items?: T[];
  meta?: unknown;
}

function normalizeProduct(p: RawProduct): Product {
  const stocks = Array.isArray(p.stocks) ? p.stocks : [];
  const totalStock = stocks.reduce(
    (sum: number, s: RawStock) => sum + (Number(s.quantity) || 0),
    0,
  );

  const price =
    p.price !== undefined && p.price !== null
      ? Number(p.price)
      : p.sellingPrice !== undefined && p.sellingPrice !== null
      ? Number(p.sellingPrice)
      : 0;

  const variants = Array.isArray(p.variants)
    ? p.variants.map((v: RawVariant) => {
        const vStocks = Array.isArray(v.stocks) ? v.stocks : [];
        const vTotalStock = vStocks.reduce(
          (sum: number, s: RawStock) => sum + (Number(s.quantity) || 0),
          0,
        );
        const vPrice =
          v.price !== undefined && v.price !== null
            ? Number(v.price)
            : v.sellingPrice !== undefined && v.sellingPrice !== null
            ? Number(v.sellingPrice)
            : price;

        return {
          id: v.id,
          code: v.code,
          name: v.name,
          sku: v.sku || null,
          price: vPrice,
          image: v.image || null,
          stock: vTotalStock,
        };
      })
    : [];

  return {
    id: p.id,
    code: p.code,
    name: p.name,
    price,
    image: p.image || null,
    images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
    description: p.description || '',
    category: p.category
      ? { id: p.category.id, name: p.category.name, code: p.category.code }
      : undefined,
    brand: p.brand
      ? { id: p.brand.id, name: p.brand.name }
      : undefined,
    variants,
    totalStock: p.totalStock !== undefined ? Number(p.totalStock) : totalStock,
    isActive: p.isActive !== false,
  };
}

export const api = {
  // Telegram Authentication
  async authenticateTelegram(initData: string): Promise<CustomerAuthResponse> {
    return request<CustomerAuthResponse>('customer-auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    });
  },

  async registerCustomer(dto: {
    initData: string;
    companyName: string;
    contactName: string;
    phone: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    province?: string | null;
    district?: string | null;
    commune?: string | null;
  }): Promise<{
    success: boolean;
    status: CustomerAuthResponse['status'];
    message: string;
    customer: CustomerProfile;
  }> {
    return request('customer-auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...dto,
        address: dto.address?.trim() || 'Phnom Penh, Cambodia',
      }),
    });
  },

  async reverseGeocode(lat: number, lng: number): Promise<{
    formattedAddress: string;
    latitude: number;
    longitude: number;
    province?: string | null;
    district?: string | null;
    commune?: string | null;
  }> {
    return request(`customer-auth/location/reverse-geocode?lat=${lat}&lng=${lng}`);
  },

  async searchLocation(query: string): Promise<
    Array<{
      displayName: string;
      latitude: number;
      longitude: number;
      province?: string | null;
      district?: string | null;
      commune?: string | null;
    }>
  > {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const hasCountryContext = /(cambodia|khmer|phnom penh|kandal|siem reap|battambang|kampot|sihanoukville)/i.test(
      trimmed,
    );

    // 1. If no Cambodia context is typed, query with Cambodia suffix first to ensure local places match
    if (!hasCountryContext) {
      try {
        const biased = await request<
          Array<{
            displayName: string;
            latitude: number;
            longitude: number;
            province?: string | null;
            district?: string | null;
            commune?: string | null;
          }>
        >(
          `customer-auth/location/search?query=${encodeURIComponent(trimmed + ", Cambodia")}`,
        );
        if (Array.isArray(biased) && biased.length > 0) {
          return biased;
        }
      } catch (err) {
        console.warn("Biased location search failed, trying raw query:", err);
      }
    }

    // 2. Fall back to raw query
    try {
      const results = await request<
        Array<{
          displayName: string;
          latitude: number;
          longitude: number;
          province?: string | null;
          district?: string | null;
          commune?: string | null;
        }>
      >(`customer-auth/location/search?query=${encodeURIComponent(trimmed)}`);

      return Array.isArray(results) ? results : [];
    } catch (err) {
      console.warn("Location search error:", err);
      return [];
    }
  },

  // Catalog
  async getProducts(params?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit || 50));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request<PaginatedApiResponse<RawProduct> | RawProduct[]>(`products${qs}`);
    const rawList: RawProduct[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.items)
      ? res.items
      : [];

    return rawList.map(normalizeProduct);
  },

  async getProduct(id: string): Promise<Product> {
    const res = await request<RawProduct>(`products/${id}`);
    return normalizeProduct(res);
  },

  async getCategories(): Promise<Category[]> {
    const res = await request<PaginatedApiResponse<RawCategory> | RawCategory[]>('categories');
    const rawList: RawCategory[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.items)
      ? res.items
      : [];

    return rawList.map((c: RawCategory) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      isActive: c.isActive !== false,
    }));
  },

  // Customer Orders
  async createOrder(dto: {
    items: {
      productId: string;
      variantId?: string | null;
      quantity: number;
    }[];
    deliveryAddress?: string;
    remark?: string;
  }): Promise<CustomerOrder> {
    return request<CustomerOrder>('customer-orders', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async getMyOrders(params?: { page?: number; limit?: number }): Promise<CustomerOrder[]> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit || 20));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request<CustomerOrder[] | { items: CustomerOrder[] }>(`customer-orders/my-orders${qs}`);
    return Array.isArray(res) ? res : res.items || [];
  },

  async getMyOrder(id: string): Promise<CustomerOrder> {
    return request<CustomerOrder>(`customer-orders/my-orders/${id}`);
  },

  async sendCustomerResponse(
    orderId: string,
    dto: {
      responseType: 'ACCEPT' | 'REJECT' | 'WAIT_STOCK' | 'MESSAGE';
      acceptedQuantity?: number;
      message?: string;
      itemId?: string;
    },
  ): Promise<CustomerOrder> {
    return request<CustomerOrder>(`customer-orders/${orderId}/customer-response`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async cancelOrder(orderId: string): Promise<CustomerOrder> {
    return request<CustomerOrder>(`customer-orders/${orderId}/cancel`, {
      method: 'POST',
    });
  },
};
