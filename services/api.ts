/**
 * NestPress CMS API Service
 * Auto-generated API client based on OpenAPI specification
 * Provides typed methods for all backend endpoints
 */

import { Post, Product, Order, User, Theme, SiteSettings, Comment, Menu, MenuItem } from '../types';

// ============================================
// Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'nestpress_access_token';
const REFRESH_TOKEN_KEY = 'nestpress_refresh_token';

// ============================================
// Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author' | 'subscriber';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'published' | 'draft' | 'trash';
  categories?: string[];
  tags?: string[];
  type?: 'post' | 'page';
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  sku: string;
  status?: 'active' | 'draft' | 'archived';
  images?: string[];
  vendor?: string;
  category?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateOrderDto {
  customerName: string;
  email: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface UpdateOrderDto {
  status?: 'pending' | 'paid' | 'refunded' | 'cancelled';
  fulfillment?: 'unfulfilled' | 'partial' | 'fulfilled';
}

export interface GenerateContentDto {
  prompt: string;
  type: 'post' | 'product' | 'seo' | 'custom';
  options?: {
    tone?: string;
    length?: 'short' | 'medium' | 'long';
    keywords?: string[];
  };
}

export interface CreateMenuDto {
  name: string;
  slug: string;
  location: 'primary' | 'footer' | 'mobile' | 'custom';
  items?: MenuItem[];
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export interface CreateMenuItemDto {
  label: string;
  url: string;
  target?: '_blank' | '_self';
  cssClass?: string;
  parentId?: string;
  order: number;
  icon?: string;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ============================================
// Token Management
// ============================================

export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

// ============================================
// HTTP Client
// ============================================

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Handle 401 - try to refresh token
      if (response.status === 401) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry the request - this is handled by the caller
          throw new Error('TOKEN_REFRESHED');
        }
        tokenManager.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      const error: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
      }));

      throw new Error(error.message || 'An error occurred');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Safely parse JSON response
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse API response:', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          tokenManager.setTokens(data.accessToken, data.refreshToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async get<T>(endpoint: string, params?: Record<string, any>, retry = true): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: await this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retry) {
        return this.get<T>(endpoint, params, false);
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, includeAuth = true, retry = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await this.getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retry) {
        return this.post<T>(endpoint, data, includeAuth, false);
      }
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any, retry = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retry) {
        return this.put<T>(endpoint, data, false);
      }
      throw error;
    }
  }

  async patch<T>(endpoint: string, data: any, retry = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: await this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retry) {
        return this.patch<T>(endpoint, data, false);
      }
      throw error;
    }
  }

  async delete<T>(endpoint: string, retry = true): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retry) {
        return this.delete<T>(endpoint, false);
      }
      throw error;
    }
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

// ============================================
// Auth API
// ============================================

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, false);
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data, false);
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenManager.clearTokens();
    }
  },

  getProfile: async (): Promise<ApiUser> => {
    // Backend returns user directly, not wrapped in ApiResponse
    const user = await apiClient.get<ApiUser>('/auth/me');
    return user;
  },

  refreshToken: async (): Promise<boolean> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken },
        false
      );
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      return true;
    } catch {
      tokenManager.clearTokens();
      return false;
    }
  },
};

// ============================================
// Posts API
// ============================================

export const postsApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; type?: string }): Promise<PaginatedResponse<Post>> => {
    return apiClient.get<PaginatedResponse<Post>>('/posts', params);
  },

  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data;
  },

  create: async (data: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<any>>('/posts', data);
    console.log('postsApi.create response:', response);
    return response.data || response;
  },

  update: async (id: string, data: UpdatePostDto): Promise<Post> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/posts/${id}`, data);
    console.log('postsApi.update response:', response);
    return response.data || response;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  publish: async (id: string): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<any>>(`/posts/${id}/publish`);
    return response.data || response;
  },

  unpublish: async (id: string): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<any>>(`/posts/${id}/unpublish`);
    return response.data || response;
  },
};

// ============================================
// Pages API
// ============================================

export const pagesApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<Post>> => {
    return apiClient.get<PaginatedResponse<Post>>('/pages', params);
  },

  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get<ApiResponse<Post>>(`/pages/${id}`);
    return response.data;
  },

  create: async (data: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<any>>('/pages', data);
    console.log('pagesApi.create response:', response);
    return response.data || response;
  },

  update: async (id: string, data: UpdatePostDto): Promise<Post> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/pages/${id}`, data);
    console.log('pagesApi.update response:', response);
    return response.data || response;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pages/${id}`);
  },
};

// ============================================
// Products API
// ============================================

export const productsApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; category?: string }): Promise<PaginatedResponse<Product>> => {
    return apiClient.get<PaginatedResponse<Product>>('/products', params);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  updateInventory: async (id: string, quantity: number): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/inventory`, { quantity });
    return response.data;
  },
};

// ============================================
// Orders API
// ============================================

export const ordersApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; fulfillment?: string }): Promise<PaginatedResponse<Order>> => {
    return apiClient.get<PaginatedResponse<Order>>('/orders', params);
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateOrderDto): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  fulfill: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/fulfill`);
    return response.data;
  },

  refund: async (id: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/refund`);
    return response.data;
  },
};

// ============================================
// Users API
// ============================================

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; role?: string }): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/users', params);
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  create: async (data: { name: string; email: string; password: string; role?: string }): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data;
  },
};

// ============================================
// Themes API
// ============================================

export const themesApi = {
  getAll: async (): Promise<Theme[]> => {
    const response = await apiClient.get<Theme[] | ApiResponse<Theme[]>>('/themes');
    // Handle both wrapped {data: []} and unwrapped [] responses
    return Array.isArray(response) ? response : (response.data || []);
  },

  getById: async (id: string): Promise<Theme> => {
    const response = await apiClient.get<Theme | ApiResponse<Theme>>(`/themes/${id}`);
    return (response as any).data || response;
  },

  getActive: async (): Promise<Theme> => {
    const response = await apiClient.get<Theme | ApiResponse<Theme>>('/themes/active');
    return (response as any).data || response;
  },

  activate: async (id: string): Promise<Theme> => {
    const response = await apiClient.post<Theme | ApiResponse<Theme>>(`/themes/${id}/activate`);
    return (response as any).data || response;
  },

  update: async (id: string, data: Partial<Theme>): Promise<Theme> => {
    const response = await apiClient.patch<Theme | ApiResponse<Theme>>(`/themes/${id}`, data);
    return (response as any).data || response;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/themes/${id}`);
  },

  upload: async (file: File): Promise<Theme> => {
    const response = await apiClient.upload<Theme | ApiResponse<Theme>>('/themes/upload', file);
    return (response as any).data || response;
  },

  rescan: async (): Promise<Theme[]> => {
    const response = await apiClient.get<Theme[] | ApiResponse<Theme[]>>('/themes/rescan');
    return Array.isArray(response) ? response : (response.data || []);
  },
};

// ============================================
// Comments API
// ============================================

export type CommentStatus = 'pending' | 'approved' | 'spam' | 'trash';
export type ModerationAction = 'approve' | 'unapprove' | 'spam' | 'trash' | 'delete';

export interface ApiComment {
  id: string;
  postId: string;
  postTitle?: string;
  parentId?: string;
  authorId?: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  status: CommentStatus;
  karma: number;
  approved: boolean;
  type: 'comment' | 'pingback' | 'trackback';
  createdAt: string;
  updatedAt: string;
  children?: ApiComment[]; // For threaded comments
}

export interface CreateCommentData {
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
}

export interface CommentCounts {
  pending: number;
  approved: number;
  spam: number;
  trash: number;
  all: number;
}

export const commentsApi = {
  // Public endpoints
  create: async (data: CreateCommentData): Promise<ApiComment> => {
    const response = await apiClient.post<ApiComment | ApiResponse<ApiComment>>('/comments', data, false);
    return (response as any).data || response;
  },

  getByPost: async (postId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ApiComment>> => {
    return apiClient.get<PaginatedResponse<ApiComment>>(`/comments/post/${postId}`, params);
  },

  getThreadedByPost: async (postId: string): Promise<ApiComment[]> => {
    const response = await apiClient.get<ApiComment[] | ApiResponse<ApiComment[]>>(`/comments/post/${postId}/threaded`);
    return Array.isArray(response) ? response : (response.data || []);
  },

  getRecent: async (limit?: number): Promise<ApiComment[]> => {
    const response = await apiClient.get<ApiComment[] | ApiResponse<ApiComment[]>>('/comments/recent', { limit });
    return Array.isArray(response) ? response : (response.data || []);
  },

  reply: async (parentId: string, data: CreateCommentData): Promise<ApiComment> => {
    const response = await apiClient.post<ApiComment | ApiResponse<ApiComment>>(`/comments/${parentId}/reply`, data, false);
    return (response as any).data || response;
  },

  // Authenticated endpoints
  createAuthenticated: async (data: CreateCommentData): Promise<ApiComment> => {
    const response = await apiClient.post<ApiComment | ApiResponse<ApiComment>>('/comments/authenticated', data);
    return (response as any).data || response;
  },

  // Admin endpoints
  getAll: async (params?: { page?: number; limit?: number; status?: CommentStatus; postId?: string }): Promise<PaginatedResponse<ApiComment>> => {
    return apiClient.get<PaginatedResponse<ApiComment>>('/comments', params);
  },

  getCounts: async (postId?: string): Promise<CommentCounts> => {
    const response = await apiClient.get<CommentCounts | ApiResponse<CommentCounts>>('/comments/counts', { postId });
    return (response as any).data || response;
  },

  getById: async (id: string): Promise<ApiComment> => {
    const response = await apiClient.get<ApiComment | ApiResponse<ApiComment>>(`/comments/${id}`);
    return (response as any).data || response;
  },

  update: async (id: string, data: { content?: string; status?: CommentStatus }): Promise<ApiComment> => {
    const response = await apiClient.patch<ApiComment | ApiResponse<ApiComment>>(`/comments/${id}`, data);
    return (response as any).data || response;
  },

  moderate: async (id: string, action: ModerationAction): Promise<ApiComment> => {
    const response = await apiClient.post<ApiComment | ApiResponse<ApiComment>>(`/comments/${id}/moderate`, { action });
    return (response as any).data || response;
  },

  bulkModerate: async (commentIds: string[], action: ModerationAction): Promise<{ success: number; failed: number }> => {
    return apiClient.post<{ success: number; failed: number }>('/comments/bulk-moderate', { commentIds, action });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },
};

// ============================================
// Settings API
// ============================================

export const settingsApi = {
  get: async (): Promise<SiteSettings> => {
    const response = await apiClient.get<SiteSettings | ApiResponse<SiteSettings>>('/settings');
    return (response as any).data || response;
  },

  update: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const response = await apiClient.patch<SiteSettings | ApiResponse<SiteSettings>>('/settings', data);
    return (response as any).data || response;
  },

  getSeo: async (): Promise<SiteSettings['seo']> => {
    const response = await apiClient.get<SiteSettings['seo'] | ApiResponse<SiteSettings['seo']>>('/settings/seo');
    return (response as any).data || response;
  },

  updateSeo: async (data: Partial<SiteSettings['seo']>): Promise<SiteSettings['seo']> => {
    const response = await apiClient.patch<SiteSettings['seo'] | ApiResponse<SiteSettings['seo']>>('/settings/seo', data);
    return (response as any).data || response;
  },
};

// ============================================
// Media API
// ============================================

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  createdAt: string;
}

export const mediaApi = {
  getAll: async (params?: { page?: number; limit?: number; type?: string }): Promise<PaginatedResponse<MediaItem>> => {
    return apiClient.get<PaginatedResponse<MediaItem>>('/media', params);
  },

  getById: async (id: string): Promise<MediaItem> => {
    const response = await apiClient.get<ApiResponse<MediaItem>>(`/media/${id}`);
    return response.data;
  },

  upload: async (file: File, alt?: string, caption?: string): Promise<MediaItem> => {
    const response = await apiClient.upload<ApiResponse<MediaItem>>('/media/upload', file, {
      ...(alt && { alt }),
      ...(caption && { caption }),
    });
    return response.data;
  },

  update: async (id: string, data: { alt?: string; caption?: string }): Promise<MediaItem> => {
    const response = await apiClient.patch<ApiResponse<MediaItem>>(`/media/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  },
};

// ============================================
// AI API
// ============================================

export const aiApi = {
  generateContent: async (data: GenerateContentDto): Promise<{ content: string }> => {
    const response = await apiClient.post<ApiResponse<{ content: string }>>('/ai/generate', data);
    return response.data;
  },

  generatePostContent: async (title: string, context?: string): Promise<{ content: string; excerpt: string }> => {
    const response = await apiClient.post<ApiResponse<{ content: string; excerpt: string }>>('/ai/generate/post', {
      title,
      context,
    });
    return response.data;
  },

  generateProductDescription: async (title: string, features?: string[]): Promise<{ description: string }> => {
    const response = await apiClient.post<ApiResponse<{ description: string }>>('/ai/generate/product', {
      title,
      features,
    });
    return response.data;
  },

  generateSeoMeta: async (content: string): Promise<{ title: string; description: string; keywords: string[] }> => {
    const response = await apiClient.post<ApiResponse<{ title: string; description: string; keywords: string[] }>>(
      '/ai/generate/seo',
      { content }
    );
    return response.data;
  },

  improveContent: async (content: string, instruction?: string): Promise<{ content: string }> => {
    const response = await apiClient.post<ApiResponse<{ content: string }>>('/ai/improve', {
      content,
      instruction,
    });
    return response.data;
  },
};

// ============================================
// Health Check
// ============================================

export interface HealthStatus {
  status: string;
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: { status: string };
}

export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    console.log('[healthApi.check] Checking backend health at:', `${API_BASE_URL}/health`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      clearTimeout(timeoutId);
      
      console.log('[healthApi.check] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from health endpoint');
      }
      const data = JSON.parse(text);
      console.log('[healthApi.check] Backend is healthy:', data);
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('[healthApi.check] Request timeout - backend not responding at:', API_BASE_URL);
        throw new Error(`Backend timeout at ${API_BASE_URL}. Is the server running?`);
      }
      console.error('[healthApi.check] Failed:', error.message);
      throw error;
    }
  },

  getStatus: async (): Promise<HealthStatus> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from health endpoint');
    }
    return JSON.parse(text);
  },

  checkApi: async (): Promise<boolean> => {
    try {
      await healthApi.check();
      return true;
    } catch (error: any) {
      console.error('❌ API health check failed:', error.message);
      console.error('   Expected backend at:', API_BASE_URL);
      console.error('   Please ensure backend is running on port 4000');
      console.error('   Run: cd backend && npm run start:dev');
      return false;
    }
  },
};

// ============================================
// System Configuration API
// ============================================

export interface SystemConfigResponse {
  id: string;
  initialized: boolean;
  setupCompletedAt?: string;
  database: {
    provider: string;
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
    connectionError?: string;
  };
  ai: {
    provider: string;
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
    connectionError?: string;
    config?: {
      maskedApiKey?: string;
      model?: string;
    };
  };
  payment: {
    provider: string;
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
    connectionError?: string;
    testMode?: boolean;
  };
  storage: {
    provider: string;
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
  };
  superAdmin?: {
    email: string;
    userId: string;
    createdAt: string;
  };
  adminCredentials?: {
    email: string;
    password: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SystemStatusResponse {
  initialized: boolean;
  database: { provider: string; ready: boolean; status: string };
  ai: { provider: string; ready: boolean; status: string };
  payment: { provider: string; ready: boolean; status: string };
  storage: { provider: string; ready: boolean; status: string };
  hasSuperAdmin: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latency?: number;
  model?: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface TestDatabaseConnectionDto {
  provider: string;
  uri?: string;
  projectId?: string;
  apiKey?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  url?: string;
  anonKey?: string;
}

export interface TestAIConnectionDto {
  provider: string;
  apiKey: string;
  model?: string;
}

export interface TestPaymentConnectionDto {
  provider: string;
  publishableKey?: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  testMode?: boolean;
}

export const systemConfigApi = {
  getConfig: async (): Promise<SystemConfigResponse> => {
    const response = await apiClient.get<ApiResponse<SystemConfigResponse>>('/system-config');
    return response.data;
  },

  getStatus: async (): Promise<SystemStatusResponse> => {
    const response = await apiClient.get<ApiResponse<SystemStatusResponse>>('/system-config/status');
    return response.data;
  },

  isInitialized: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<{ initialized: boolean }>>('/system-config/initialized');
      return response.data.initialized;
    } catch {
      return false;
    }
  },

  updateConfig: async (data: Partial<SystemConfigResponse>): Promise<SystemConfigResponse> => {
    const response = await apiClient.patch<ApiResponse<SystemConfigResponse>>('/system-config', data);
    return response.data;
  },

  completeSetup: async (): Promise<SystemConfigResponse> => {
    const response = await apiClient.post<ApiResponse<SystemConfigResponse>>('/system-config/complete-setup', {}, false);
    return response.data;
  },

  resetSetup: async (): Promise<SystemConfigResponse> => {
    const response = await apiClient.post<ApiResponse<SystemConfigResponse>>('/system-config/reset');
    return response.data;
  },

  // Test database connection
  testDatabaseConnection: async (config: TestDatabaseConnectionDto): Promise<TestConnectionResult> => {
    const response = await apiClient.post<ApiResponse<TestConnectionResult>>(
      '/system-config/test-database',
      config,
      false
    );
    return response.data;
  },

  // Test AI provider connection
  testAIConnection: async (config: TestAIConnectionDto): Promise<TestConnectionResult> => {
    const response = await apiClient.post<ApiResponse<TestConnectionResult>>(
      '/system-config/test-ai',
      config,
      false
    );
    return response.data;
  },

  // Test payment provider connection
  testPaymentConnection: async (config: TestPaymentConnectionDto): Promise<TestConnectionResult> => {
    const response = await apiClient.post<ApiResponse<TestConnectionResult>>(
      '/system-config/test-payment',
      config,
      false
    );
    return response.data;
  },

  // Get super admin credentials (one-time only)
  getAdminCredentials: async (): Promise<AdminCredentials | null> => {
    const response = await apiClient.get<ApiResponse<AdminCredentials | null>>(
      '/system-config/admin-credentials'
    );
    return response.data;
  },

  // Save wizard step configuration
  saveStepConfig: async (
    step: 'database' | 'ai' | 'payment' | 'storage',
    config: any
  ): Promise<SystemConfigResponse> => {
    const response = await apiClient.post<ApiResponse<SystemConfigResponse>>(
      `/system-config/save-step/${step}`,
      config,
      false
    );
    return response.data;
  },

  // Seed super admin
  seedSuperAdmin: async (): Promise<AdminCredentials | null> => {
    const response = await apiClient.post<ApiResponse<AdminCredentials | null>>(
      '/system-config/seed-admin',
      {},
      false
    );
    return response.data;
  },
};

// ============================================
// Templates API
// ============================================

export interface TemplateResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'page' | 'post' | 'archive' | 'single' | 'home' | 'category' | 'search' | '404' | 'partial' | 'header' | 'footer' | 'sidebar' | 'custom';
  status: 'active' | 'draft' | 'inactive';
  thumbnail?: string;
  content: string;
  blocks?: any[];
  settings: {
    layout: 'full-width' | 'boxed' | 'sidebar-left' | 'sidebar-right' | 'no-sidebar';
    containerWidth?: string;
    showHeader: boolean;
    showFooter: boolean;
    showSidebar: boolean;
    sidebarPosition?: 'left' | 'right';
    showTitle: boolean;
    titlePosition?: 'above' | 'in-content' | 'hidden';
    showFeaturedImage: boolean;
    featuredImagePosition?: 'above-title' | 'below-title' | 'background' | 'hidden';
    showMeta: boolean;
    showAuthor: boolean;
    showDate: boolean;
    showCategories: boolean;
    showTags: boolean;
    showComments: boolean;
    customCss?: string;
    bodyClass?: string;
    containerClass?: string;
  };
  parent?: string;
  isDefault: boolean;
  version: string;
  author: string;
  themeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  slug?: string;
  description?: string;
  type: 'page' | 'post' | 'archive' | 'single' | 'home' | 'category' | 'search' | '404' | 'partial' | 'header' | 'footer' | 'sidebar' | 'custom';
  content: string;
  blocks?: any[];
  settings?: Partial<TemplateResponse['settings']>;
  parent?: string;
  isDefault?: boolean;
  themeId?: string;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export interface TemplateHierarchyResponse {
  resolved: TemplateResponse;
  hierarchy: string[];
  fallbackChain: TemplateResponse[];
}

export const templatesApi = {
  // Get all templates
  getAll: async (params?: { type?: string; status?: string }): Promise<TemplateResponse[]> => {
    const response = await apiClient.get<ApiResponse<TemplateResponse[]>>('/templates', params);
    return response.data;
  },

  // Get template by ID
  getById: async (id: string): Promise<TemplateResponse> => {
    const response = await apiClient.get<ApiResponse<TemplateResponse>>(`/templates/${id}`);
    return response.data;
  },

  // Get templates by type
  getByType: async (type: string): Promise<TemplateResponse[]> => {
    const response = await apiClient.get<ApiResponse<TemplateResponse[]>>('/templates', { type });
    return response.data;
  },

  // Get default template for type
  getDefault: async (type: string): Promise<TemplateResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<TemplateResponse>>('/templates/default', { type });
      return response.data;
    } catch {
      return null;
    }
  },

  // Resolve template hierarchy
  resolveHierarchy: async (type: string, slug: string): Promise<TemplateHierarchyResponse> => {
    const response = await apiClient.get<ApiResponse<TemplateHierarchyResponse>>(
      `/templates/hierarchy/${type}/${slug}`
    );
    return response.data;
  },

  // Create template
  create: async (data: CreateTemplateDto): Promise<TemplateResponse> => {
    const response = await apiClient.post<ApiResponse<TemplateResponse>>('/templates', data);
    return response.data;
  },

  // Update template
  update: async (id: string, data: UpdateTemplateDto): Promise<TemplateResponse> => {
    const response = await apiClient.patch<ApiResponse<TemplateResponse>>(`/templates/${id}`, data);
    return response.data;
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },

  // Assign template to post/page
  assignToPost: async (templateId: string, postId: string, postType: 'post' | 'page' = 'post'): Promise<void> => {
    await apiClient.post(`/templates/${templateId}/assign`, { postId, postType });
  },

  // Clone template
  clone: async (id: string, newName: string): Promise<TemplateResponse> => {
    const response = await apiClient.post<ApiResponse<TemplateResponse>>(`/templates/${id}/clone`, { name: newName });
    return response.data;
  },

  // Set as default
  setAsDefault: async (id: string): Promise<TemplateResponse> => {
    const response = await apiClient.patch<ApiResponse<TemplateResponse>>(`/templates/${id}`, { isDefault: true });
    return response.data;
  },

  // Toggle active state
  toggleActive: async (id: string, isActive: boolean): Promise<TemplateResponse> => {
    const response = await apiClient.patch<ApiResponse<TemplateResponse>>(`/templates/${id}`, { isActive });
    return response.data;
  },
};

// ============================================
// Plugins API (WordPress-compatible)
// ============================================

export interface PluginResponse {
  id: string;
  slug: string;
  name: string;
  pluginUri?: string;
  version: string;
  description: string;
  author: string;
  authorUri?: string;
  license?: string;
  textDomain?: string;
  domainPath?: string;
  network?: boolean;
  requiresAtLeast?: string;
  requiresNode?: string;
  updateUri?: string;
  
  // NestPress additions
  isActive: boolean;
  activatedAt?: string;
  path: string;
  hasSettings: boolean;
  hasAdminMenu: boolean;
  dependencies?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface PluginInstallDto {
  source: 'upload' | 'directory' | 'url';
  path?: string;
  url?: string;
}

// Helper to map backend PascalCase fields to frontend camelCase
const mapPluginResponse = (plugin: any): PluginResponse => {
  if (!plugin || typeof plugin !== 'object' || Array.isArray(plugin)) {
    console.error('Invalid plugin data:', plugin);
    return {
      id: 'unknown',
      slug: 'unknown',
      name: 'Unknown Plugin',
      version: '1.0.0',
      description: '',
      author: 'Unknown',
      isActive: false,
      path: '',
      hasSettings: false,
      hasAdminMenu: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const mapped = {
    id: plugin.Slug || plugin.slug || plugin.id || 'unknown',
    slug: plugin.Slug || plugin.slug || 'unknown',
    name: plugin.Name || plugin.name || plugin.Title || 'Unknown',
    pluginUri: plugin.PluginURI || plugin.pluginUri,
    version: plugin.Version || plugin.version || '1.0.0',
    description: plugin.Description || plugin.description || '',
    author: plugin.Author || plugin.author || plugin.AuthorName || 'Unknown',
    authorUri: plugin.AuthorURI || plugin.authorUri,
    license: plugin.License || plugin.license,
    textDomain: plugin.TextDomain || plugin.textDomain,
    domainPath: plugin.DomainPath || plugin.domainPath,
    network: plugin.Network || plugin.network || false,
    requiresAtLeast: plugin.RequiresAtLeast || plugin.requiresAtLeast || plugin.RequiresWP,
    requiresNode: plugin.RequiresNode || plugin.requiresNode,
    updateUri: plugin.UpdateURI || plugin.updateUri,
    isActive: plugin.active ?? plugin.IsActive ?? plugin.isActive ?? false,
    activatedAt: plugin.activatedAt || plugin.ActivatedAt,
    path: plugin.File || plugin.Path || plugin.path || '',
    hasSettings: plugin.HasSettings ?? plugin.hasSettings ?? false,
    hasAdminMenu: plugin.HasAdminMenu ?? plugin.hasAdminMenu ?? false,
    dependencies: plugin.Dependencies || plugin.dependencies || plugin.RequiresPlugins,
    createdAt: plugin.CreatedAt || plugin.createdAt || new Date().toISOString(),
    updatedAt: plugin.UpdatedAt || plugin.updatedAt || new Date().toISOString(),
  };
  
  return mapped;
};

export const pluginsApi = {
  // Get all plugins
  getAll: async (): Promise<PluginResponse[]> => {
    const response = await apiClient.get<any>('/plugins');
    const plugins = Array.isArray(response) ? response : [];
    return plugins.map(mapPluginResponse);
  },

  // Get plugin by slug
  getBySlug: async (slug: string): Promise<PluginResponse> => {
    const response = await apiClient.get<any>(`/plugins/${slug}`);
    return mapPluginResponse(response);
  },

  // Activate plugin
  activate: async (slug: string): Promise<PluginResponse> => {
    await apiClient.post<any>(`/plugins/${slug}/activate`);
    // Activation returns {success, plugin: slug, message} - fetch full data
    return pluginsApi.getBySlug(slug);
  },

  // Deactivate plugin
  deactivate: async (slug: string): Promise<PluginResponse> => {
    await apiClient.post<any>(`/plugins/${slug}/deactivate`);
    // Deactivation returns {success, plugin: slug, message} - fetch full data
    return pluginsApi.getBySlug(slug);
  },

  // Delete plugin
  delete: async (slug: string): Promise<void> => {
    await apiClient.delete(`/plugins/${slug}`);
  },

  // Check for updates
  checkUpdates: async (): Promise<{ updates: Array<{ slug: string; currentVersion: string; newVersion: string }> }> => {
    const response = await apiClient.get<ApiResponse<{ updates: Array<{ slug: string; currentVersion: string; newVersion: string }> }>>('/plugins/updates');
    return response.data;
  },

  // Update plugin
  update: async (slug: string): Promise<PluginResponse> => {
    const response = await apiClient.post<ApiResponse<PluginResponse>>(`/plugins/${slug}/update`);
    return response.data;
  },

  // Install plugin (from upload or URL)
  install: async (data: PluginInstallDto): Promise<PluginResponse> => {
    const response = await apiClient.post<ApiResponse<PluginResponse>>('/plugins/install', data);
    return response.data;
  },

  // Upload plugin ZIP
  upload: async (file: File): Promise<PluginResponse> => {
    const response = await apiClient.upload<ApiResponse<PluginResponse>>('/plugins/upload', file);
    return response.data;
  },

  // Get plugin settings
  getSettings: async (slug: string): Promise<Record<string, any>> => {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>(`/plugins/${slug}/settings`);
    return response.data;
  },

  // Update plugin settings
  updateSettings: async (slug: string, settings: Record<string, any>): Promise<void> => {
    await apiClient.patch(`/plugins/${slug}/settings`, settings);
  },

  // Refresh plugins (re-scan directory)
  refresh: async (): Promise<PluginResponse[]> => {
    const response = await apiClient.post<ApiResponse<PluginResponse[]>>('/plugins/refresh');
    return response.data;
  },

  // Get dashboard widgets from active plugins
  getDashboardWidgets: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/plugins/widgets/dashboard');
    return Array.isArray(response) ? response : [];
  },

  // Get menu item panels from active plugins
  getMenuItemPanels: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/plugins/menu-item-panels');
    return Array.isArray(response) ? response : [];
  },

  // Get plugin files (for editor)
  getFiles: async (slug: string): Promise<{ files: any[] }> => {
    const response = await apiClient.get<ApiResponse<{ files: any[] }>>(`/plugins/${slug}/files`);
    return response.data;
  },

  // Get plugin file content
  getFileContent: async (slug: string, filePath: string): Promise<{ content: string }> => {
    const response = await apiClient.get<ApiResponse<{ content: string }>>(`/plugins/${slug}/files/content`, {
      params: { path: filePath }
    });
    return response.data;
  },

  // Update plugin file content
  updateFileContent: async (slug: string, filePath: string, content: string): Promise<void> => {
    await apiClient.put(`/plugins/${slug}/files/content`, { path: filePath, content });
  },

  // Get admin menu items from active plugins
  getAdminMenuItems: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/plugins/admin-menu');
    return Array.isArray(response.data) ? response.data : [];
  },

  // Get admin submenu items
  getAdminSubMenuItems: async (parentSlug?: string): Promise<any[]> => {
    const url = parentSlug ? `/plugins/admin-menu/${parentSlug}` : '/plugins/admin-menu';
    const response = await apiClient.get<any>(url);
    // Backend returns array directly, not wrapped in ApiResponse
    return Array.isArray(response) ? response : [];
  },

  // Get plugin assets (styles and scripts)
  getAssets: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/plugins/assets');
    return Array.isArray(response) ? response : [];
  },

  // Get plugin widgets
  getWidgets: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/plugins/widgets');
    return Array.isArray(response) ? response : [];
  },
};

// ============================================
// Menus API
// ============================================

export const menusApi = {
  // Get all menus
  getAll: async (): Promise<Menu[]> => {
    const response = await apiClient.get<Menu[] | ApiResponse<Menu[]>>('/appearance/menus');
    return Array.isArray(response) ? response : (response as ApiResponse<Menu[]>).data || [];
  },

  // Get menu by ID
  getById: async (id: string): Promise<Menu> => {
    const response = await apiClient.get<Menu | ApiResponse<Menu>>(`/appearance/menus/${id}`);
    return 'data' in response ? response.data : response;
  },

  // Get menu by location
  getByLocation: async (location: string): Promise<Menu | null> => {
    const response = await apiClient.get<Menu | ApiResponse<Menu> | null>(`/appearance/menus/location/${location}`);
    if (!response) return null;
    return 'data' in response ? response.data : response;
  },

  // Create menu
  create: async (data: CreateMenuDto): Promise<Menu> => {
    const response = await apiClient.post<Menu | ApiResponse<Menu>>('/appearance/menus', data);
    return 'data' in response ? response.data : response;
  },

  // Update menu
  update: async (id: string, data: UpdateMenuDto): Promise<Menu> => {
    const response = await apiClient.put<Menu | ApiResponse<Menu>>(`/appearance/menus/${id}`, data);
    return 'data' in response ? response.data : response;
  },

  // Delete menu
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/appearance/menus/${id}`);
  },

  // Add menu item
  addItem: async (menuId: string, item: CreateMenuItemDto): Promise<Menu> => {
    const response = await apiClient.post<Menu | ApiResponse<Menu>>(`/appearance/menus/${menuId}/items`, item);
    return 'data' in response ? response.data : response;
  },

  // Update menu item
  updateItem: async (menuId: string, itemId: string, data: UpdateMenuItemDto): Promise<Menu> => {
    const response = await apiClient.put<Menu | ApiResponse<Menu>>(`/appearance/menus/${menuId}/items/${itemId}`, data);
    return 'data' in response ? response.data : response;
  },

  // Delete menu item
  deleteItem: async (menuId: string, itemId: string): Promise<Menu> => {
    const response = await apiClient.delete<Menu | ApiResponse<Menu>>(`/appearance/menus/${menuId}/items/${itemId}`);
    return 'data' in response ? response.data : response;
  },

  // Reorder menu items
  reorder: async (menuId: string, itemIds: string[]): Promise<Menu> => {
    const response = await apiClient.post<Menu | ApiResponse<Menu>>(`/appearance/menus/${menuId}/reorder`, { itemIds });
    return 'data' in response ? response.data : response;
  },
};

// ============================================
// Export default instance
// ============================================

export const api = {
  auth: authApi,
  posts: postsApi,
  pages: pagesApi,
  products: productsApi,
  orders: ordersApi,
  users: usersApi,
  themes: themesApi,
  settings: settingsApi,
  media: mediaApi,
  ai: aiApi,
  comments: commentsApi,
  health: healthApi,
  systemConfig: systemConfigApi,
  templates: templatesApi,
  plugins: pluginsApi,
  menus: menusApi,
};

export default api;
