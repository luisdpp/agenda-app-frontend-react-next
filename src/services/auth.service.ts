// Definimos la URL base de tu backend de NestJS
const API_URL = 'http://localhost:3000/api'; // Ajusta el puerto si tu backend usa otro (ej. 8080)

// Creamos la interfaz con el tipado estricto de las credenciales
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Servicio encargado de la comunicación con los endpoints de autenticación.
 */
export const authService = {
  
  /**
   * Envía las credenciales al backend para iniciar sesión.
   * @param credentials Objeto con el email y password de tipo LoginCredentials.
   */
  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Si el servidor responde con un código de error (400, 401, 500, etc.)
      if (!response.ok) {
        throw new Error('Credenciales inválidas o error en el servidor');
      }

      // Convertimos la respuesta a un objeto JSON de JavaScript
      return await response.json();
    } catch (error) {
      console.error('Error en authService.login:', error);
      throw error;
    }
  }
};