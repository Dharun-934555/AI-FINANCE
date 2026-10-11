const API_BASE = 'http://localhost:8000/api';

export const api = {
  getToken: () => localStorage.getItem('finora_token') || 'demo-token',
  setToken: (token: string) => localStorage.setItem('finora_token', token),
  clearToken: () => localStorage.removeItem('finora_token'),

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(err.detail || 'Request failed');
    }

    return res.json();
  },

  // Auth
  login: (data: { email: string; password: string }) => 
    api.request<{ access_token: string; token_type: string; user_id: string; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; username: string; password: string }) =>
    api.request<{ access_token: string; token_type: string; user_id: string; username: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  demoLogin: () => api.request<{ access_token: string; token_type: string; user_id: string; username: string }>('/auth/demo-login', { method: 'POST' }),
  resetDemo: () => api.request<{ message: string }>('/auth/demo-reset', { method: 'POST' }),
  getMe: () => api.request<any>('/auth/me'),

  // Dashboard & Forecast
  getDashboardSummary: () => api.request<any>('/dashboard/summary'),
  getForecast: () => api.request<any>('/dashboard/forecast'),

  // Transactions
  getTransactions: (params?: { category?: string; type?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.request<any[]>(`/transactions${query ? `?${query}` : ''}`);
  },
  createTransaction: (data: any, commitmentId?: string) => 
    api.request<any>(`/transactions${commitmentId ? `?commitment_id=${commitmentId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id: string) => api.request<any>(`/transactions/${id}`, { method: 'DELETE' }),

  // Budget
  getBudget: () => api.request<any>('/budget'),
  updateAllocations: (allocations: any[]) => api.request<any>('/budget/allocations', {
    method: 'PUT',
    body: JSON.stringify(allocations),
  }),
  getCommitments: () => api.request<any[]>('/budget/commitments'),
  createCommitment: (data: any) => api.request<any>('/budget/commitments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Savings
  getSavingsGoals: () => api.request<any[]>('/savings/goals'),
  createSavingsGoal: (data: any) => api.request<any>('/savings/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  togglePauseGoal: (id: string) => api.request<any>(`/savings/goals/${id}/pause`, { method: 'PATCH' }),
  addSavingsContribution: (id: string, amount: number, note?: string) => 
    api.request<any>(`/savings/goals/${id}/contributions`, {
      method: 'POST',
      body: JSON.stringify({ amount, note }),
    }),

  // Subscriptions
  getSubscriptions: () => api.request<any[]>('/subscriptions'),
  createSubscription: (data: any) => api.request<any>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleSubscriptionStatus: (id: string, action: string) => 
    api.request<any>(`/subscriptions/${id}/toggle-status?action=${action}`, { method: 'PATCH' }),

  // Simulations
  previewSimulation: (data: any) => api.request<any>('/simulations/preview', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  applySimulation: (data: any) => api.request<any>('/simulations/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Intelligence
  getHealthCenter: () => api.request<any>('/intelligence/health-center'),
  runStressTest: (testType: string) => api.request<any>(`/intelligence/stress-test?test_type=${testType}`, { method: 'POST' }),
  getCrisisRecovery: (emergencyAmount: number = 2000) => 
    api.request<any>(`/intelligence/crisis-recovery?emergency_amount=${emergencyAmount}`),
  askAiCoach: (query?: string) => 
    api.request<any>(`/intelligence/ai-coach${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  getChallenges: () => api.request<any[]>('/intelligence/challenges'),
  joinChallenge: (id: string) => api.request<any>(`/intelligence/challenges/${id}/join`, { method: 'POST' }),
  getNotifications: () => api.request<any[]>('/intelligence/notifications'),
  markNotificationRead: (id: string) => api.request<any>(`/intelligence/notifications/${id}/read`, { method: 'PATCH' }),
};
