const API_URL = 'http://localhost:3000/api';

export const dashboardService = {
  /**
   * Consulta las métricas analíticas desde el backend Express
   */
  async getMetrics() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las métricas del dashboard');
    }

    return await response.json();
  }
};