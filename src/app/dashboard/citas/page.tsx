'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './citas.module.css';
import { citasService, Cita, CitaPayload, BloqueDisponible } from '@/services/citas.service';
import { categoriasService } from '@/services/categorias.service';

export default function CitasPage() {
  const [userRole, setUserRole] = useState<string>('');
  const [categoriasList, setCategoriasList] = useState<{ id: number; nombre: string }[]>([]);
  const [citasList, setCitasList] = useState<Cita[]>([]);
  const [bloquesDisponiblesList, setBloquesDisponiblesList] = useState<BloqueDisponible[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const [citaForm, setCitaForm] = useState<CitaPayload>({
    fecha: '',
    categoriaId: 0,
    bloqueId: 0,
    usuarioId: 1,
  });

  const extraerUsuarioEHistorial = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUserRole(parsed.role || '');
          setCitaForm((prev) => ({ ...prev, usuarioId: parsed.id || 1 }));
        } catch {
          // fallback
        }
      }
    }

    try {
      const dataCats = await categoriasService.getCategorias();
      setCategoriasList(dataCats);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }

    try {
      const dataCitas = await citasService.getCitas();
      setCitasList(dataCitas);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    }
  }, []);

  useEffect(() => {
    extraerUsuarioEHistorial();
  }, [extraerUsuarioEHistorial]);

  // Consulta dinámica de bloques cuando cambia fecha o categoría
  const fetchDisponibilidad = useCallback(async (fecha: string, categoriaId: number) => {
    if (fecha && categoriaId > 0) {
      setLoadingHorarios(true);
      setBloquesDisponiblesList([]);
      setCitaForm((prev) => ({ ...prev, bloqueId: 0 }));

      try {
        const data = await citasService.getBloquesDisponibles(fecha, categoriaId);
        setBloquesDisponiblesList(data);
      } catch (err) {
        console.error('Error al calcular disponibilidad:', err);
      } finally {
        setLoadingHorarios(false);
      }
    }
  }, []);

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = Number(e.target.value);
    setCitaForm((prev) => ({ ...prev, categoriaId: catId }));
    fetchDisponibilidad(citaForm.fecha, catId);
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fecha = e.target.value;
    setCitaForm((prev) => ({ ...prev, fecha }));
    fetchDisponibilidad(fecha, citaForm.categoriaId);
  };

  const seleccionarHorario = (bloqueId: number) => {
    setCitaForm((prev) => ({ ...prev, bloqueId }));
  };

  const resetForm = () => {
    setCitaForm((prev) => ({
      fecha: '',
      categoriaId: 0,
      bloqueId: 0,
      usuarioId: prev.usuarioId,
    }));
    setBloquesDisponiblesList([]);
  };

  const agendarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await citasService.createCita(citaForm);
      alert('✨ ¡Cita agendada exitosamente!');
      const dataCitas = await citasService.getCitas();
      setCitasList(dataCitas);
      resetForm();
    } catch (error: any) {
      console.error('Error al agendar cita:', error);
      alert('❌ Error: ' + (error.message || 'Ya tienes una cita agendada en este mismo horario y fecha.'));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
  };

  const isFormValid = citaForm.categoriaId > 0 && citaForm.fecha !== '' && citaForm.bloqueId > 0;

  const containerClass = `${styles.container} ${
    userRole === 'ADMIN' ? styles.containerAdmin : styles.containerClient
  }`;

  return (
    <div className={containerClass}>
      {/* Formulario de Agendamiento */}
      <div className={`${styles.card} ${userRole !== 'ADMIN' ? styles.cardClient : ''}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span>📅</span> Agendar Nueva Cita
          </h3>
          <p className={styles.subtitle}>
            Selecciona los parámetros para calcular los turnos disponibles.
          </p>
        </div>

        <form onSubmit={agendarCita} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>1. Servicio / Categoría</label>
            <select
              className={styles.select}
              value={citaForm.categoriaId}
              onChange={handleCategoriaChange}
              required
            >
              <option value={0} disabled>
                Seleccione un servicio...
              </option>
              {categoriasList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>2. Seleccionar Fecha</label>
            <input
              type="date"
              className={styles.input}
              value={citaForm.fecha}
              onChange={handleFechaChange}
              required
            />
          </div>

          {citaForm.categoriaId > 0 && citaForm.fecha && (
            <div className={styles.horariosSection}>
              <label className={styles.label}>3. Horarios Disponibles</label>

              {loadingHorarios && (
                <div className={styles.loadingText}>🔍 Calculando cupos disponibles...</div>
              )}

              {!loadingHorarios && bloquesDisponiblesList.length === 0 && (
                <div className={styles.emptySlots}>
                  📭 No hay franjas horarias configuradas para este día.
                </div>
              )}

              {!loadingHorarios && bloquesDisponiblesList.length > 0 && (
                <div className={styles.gridSlots}>
                  {bloquesDisponiblesList.map((blq) => {
                    const isSelected = citaForm.bloqueId === blq.id;
                    return (
                      <button
                        key={blq.id}
                        type="button"
                        disabled={!blq.disponible}
                        onClick={() => seleccionarHorario(blq.id)}
                        className={`${styles.slotBtn} ${isSelected ? styles.slotSelected : ''}`}
                      >
                        <span className={styles.slotTime}>
                          {blq.horaInicio} - {blq.horaFin}
                        </span>
                        <span className={styles.slotCount}>
                          Cupos: {blq.cuposDisponibles} libres
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={!isFormValid} className={styles.btnSubmit}>
            🚀 Confirmar Agendamiento
          </button>
        </form>
      </div>

      {/* Tabla de Citas (Solo visible para ADMIN) */}
      {userRole === 'ADMIN' && (
        <div className={styles.card}>
          <h3 className={styles.title} style={{ marginBottom: '1rem' }}>
            📋 Control de Citas Registradas
          </h3>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Fecha Cita</th>
                  <th className={styles.th}>Franja Horaria</th>
                  <th className={styles.th}>Usuario Dueño</th>
                  <th className={styles.th}>Categoría Servicio</th>
                </tr>
              </thead>
              <tbody>
                {citasList.map((cita) => (
                  <tr key={cita.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdFecha}`}>
                      {formatDate(cita.fecha)}
                    </td>
                    <td className={`${styles.td} ${styles.tdHorario}`}>
                      {cita.bloque?.horaInicio} - {cita.bloque?.horaFin}
                    </td>
                    <td className={`${styles.td} ${styles.tdUsuario}`}>
                      {cita.usuario?.nombre || cita.usuario?.email || `ID: ${cita.usuarioId}`}
                    </td>
                    <td className={styles.td}>
                      <span className={styles.badgeCategory}>
                        {cita.categoria?.nombre}
                      </span>
                    </td>
                  </tr>
                ))}

                {citasList.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyTable}>
                      📭 No hay citas agendadas en el sistema todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}