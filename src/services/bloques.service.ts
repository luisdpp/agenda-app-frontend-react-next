const API_URL = 'http://localhost:3000/api';

export interface Bloque {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  categoriaId: number;
  categoria?: { id: number; nombre: string };
}

export type BloquePayload = Omit<Bloque, 'id' | 'categoria'>;

export const bloquesService = {
  async getBloques(): Promise<Bloque[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/bloques`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
    });
    if (!response.ok) throw new Error('Error al obtener bloques');
    return await response.json();
  },

  async createBloque(bloque: BloquePayload): Promise<Bloque> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/bloques`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify(bloque),
    });
    if (!response.ok) throw new Error('Error al crear bloque');
    return await response.json();
  },

  async updateBloque(id: number, bloque: BloquePayload): Promise<Bloque> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/bloques/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
      body: JSON.stringify(bloque),
    });
    if (!response.ok) throw new Error('Error al actualizar bloque');
    return await response.json();
  },

  async deleteBloque(id: number): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/bloques/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
    });
    if (!response.ok) throw new Error('Error al eliminar bloque');
  },
};