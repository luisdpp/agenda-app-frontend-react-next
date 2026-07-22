const API_URL = 'http://localhost:3000/api';

export const categoriasService = {
  async getCategorias() {
    const response = await fetch(`${API_URL}/categorias`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener categorías');
    return await response.json();
  },

  async createCategoria(categoria: { nombre: string; limitePorBloque: number }) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify(categoria),
    });
    if (!response.ok) throw new Error('Error al crear categoría');
    return await response.json();
  },

  async updateCategoria(id: number, categoria: { nombre: string; limitePorBloque: number }) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify(categoria),
    });
    if (!response.ok) throw new Error('Error al actualizar categoría');
    return await response.json();
  },

  async deleteCategoria(id: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
    });
    if (!response.ok) throw new Error('Error al eliminar categoría');
    return await response.json();
  },
};