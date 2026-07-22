const API_URL = 'http://localhost:3000/api';

export interface CitaPayload {
  fecha: string;
  categoriaId: number;
  bloqueId: number;
  usuarioId: number;
}

export interface Cita {
  id: number;
  fecha: string;
  usuarioId: number;
  categoriaId: number;
  bloqueId: number;
  usuario?: { nombre?: string; email?: string };
  categoria?: { nombre: string };
  bloque?: { horaInicio: string; horaFin: string };
}

export interface BloqueDisponible {
  id: number;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  cuposDisponibles: number;
}

export const citasService = {
  async getCitas(): Promise<Cita[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/citas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      },
    });
    if (!response.ok) throw new Error('Error al cargar las citas');
    return await response.json();
  },

  async createCita(cita: CitaPayload): Promise<Cita> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) throw new Error('No se encontró token de autenticación');

    const response = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cita),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || errData.mensaje || 'Error al agendar cita');
    }

    return await response.json();
  },

  async getBloquesDisponibles(fecha: string, categoriaId: number): Promise<BloqueDisponible[]> {
    const url = `${API_URL}/bloques/disponibles?fecha=${fecha}&categoriaId=${categoriaId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al calcular disponibilidad');
    return await response.json();
  },
};