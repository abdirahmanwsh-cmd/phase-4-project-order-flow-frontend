const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5555/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('auth_token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.message || data.error || JSON.stringify(data) || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Cart & Order endpoints
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // M-Pesa Payment endpoints
  async initiateMpesaPayment(paymentData) {
    return this.request('/payments/mpesa/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async checkPaymentStatus(transactionId) {
    return this.request(`/payments/status/${transactionId}`);
  }

  // Menu endpoints (for cart items)
  async getMenuItems() {
    return this.request('/menu');
  }

  async getMenuItem(itemId) {
    return this.request(`/menu/${itemId}`);
  }
}

export default new ApiService();
