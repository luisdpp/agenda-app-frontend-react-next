'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './bloques.module.css';
import { bloquesService, Bloque, BloquePayload } from '@/services/bloques.service';
import { categoriasService } from '@/services/categorias.service';

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

export default function BloquesComponent() {
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [idInEdit, setIdInEdit] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<BloquePayload>({
    diaSemana: 0,
    horaInicio: '',
    horaFin: '',
    categoriaId: 0,
  });

  const [filterSearch, setFilterSearch] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadData = async () => {
    try {
      const [dataBloques, dataCategorias] = await Promise.all([
        bloquesService.getBloques(),
        categoriasService.getCategorias(),
      ]);
      setBloques(dataBloques);
      setCategorias(dataCategorias);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDiaTexto = (diaNumero: number): string => {
    const diasMap: Record<number, string> = {
      1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves', 5: 'viernes', 6: 'sábado', 0: 'domingo'
    };
    return diasMap[diaNumero] || '';
  };

  const resetForm = () => {
    setIsEditMode(false);
    setIdInEdit(null);
    setFormData({ diaSemana: 0, horaInicio: '', horaFin: '', categoriaId: 0 });
  };

  const handleEdit = (bloque: Bloque) => {
    setIsEditMode(true);
    setIdInEdit(bloque.id);
    setFormData({
      diaSemana: bloque.diaSemana,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      categoriaId: bloque.categoriaId,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && idInEdit !== null) {
        await bloquesService.updateBloque(idInEdit, formData);
      } else {
        await bloquesService.createBloque(formData);
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este bloque horario?')) {
      try {
        await bloquesService.deleteBloque(id);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtrado y Ordenamiento
  const processedBloques = useMemo(() => {
    const search = filterSearch.toLowerCase();

    return [...bloques]
      .filter((blq) => {
        if (!search) return true;
        const catNombre = blq.categoria?.nombre.toLowerCase() || '';
        const diaTexto = getDiaTexto(blq.diaSemana);
        return (
          catNombre.includes(search) ||
          diaTexto.includes(search) ||
          blq.horaInicio.includes(search) ||
          blq.horaFin.includes(search)
        );
      })
      .sort((a, b) => {
        let valueA: any = a[sortField as keyof Bloque];
        let valueB: any = b[sortField as keyof Bloque];

        if (sortField === 'categoria') {
          valueA = a.categoria?.nombre || '';
          valueB = b.categoria?.nombre || '';
        }

        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [bloques, filterSearch, sortField, sortDirection]);

  const isFormValid = formData.horaInicio && formData.horaFin && formData.categoriaId !== 0;

  return (
    <div className={styles.container}>
      {/* Formulario */}
      <div className={styles.card}>
        <h3 className={styles.title}>
          {isEditMode ? '✏️ Editar Bloque de Horario' : '✨ Configurar Nuevo Bloque'}
        </h3>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Día de la Semana</label>
            <select
              className={styles.select}
              value={formData.diaSemana}
              onChange={(e) => setFormData({ ...formData, diaSemana: Number(e.target.value) })}
              required
            >
              {DIAS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Hora Inicio</label>
            <input
              type="time"
              className={styles.input}
              value={formData.horaInicio}
              onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Hora Fin</label>
            <input
              type="time"
              className={styles.input}
              value={formData.horaFin}
              onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Categoría Servicio</label>
            <select
              className={styles.select}
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
              required
            >
              <option value={0} disabled>
                Seleccione...
              </option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.actionsGroup}>
            <button type="submit" disabled={!isFormValid} className={styles.btnPrimary}>
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </button>

            {isEditMode && (
              <button type="button" onClick={resetForm} title="Cancelar" className={styles.btnCancel}>
                ❌
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className={styles.card}>
        <div className={styles.tableHeader}>
          <h3 className={styles.title}>Cronograma de Bloques</h3>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="🔍 Buscar por categoría o día..."
              className={styles.input}
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => toggleSort('id')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>ID</span>
                    <span className={styles.sortIcon}>{sortField === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</span>
                  </div>
                </th>
                <th onClick={() => toggleSort('diaSemana')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>Día</span>
                    <span className={styles.sortIcon}>{sortField === 'diaSemana' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</span>
                  </div>
                </th>
                <th onClick={() => toggleSort('horaInicio')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>Franja Horaria</span>
                    <span className={styles.sortIcon}>{sortField === 'horaInicio' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</span>
                  </div>
                </th>
                <th onClick={() => toggleSort('categoria')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>Categoría Vinculada</span>
                    <span className={styles.sortIcon}>{sortField === 'categoria' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</span>
                  </div>
                </th>
                <th className={styles.th} style={{ textAlign: 'center' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {processedBloques.map((blq) => (
                <tr key={blq.id} className={styles.tr}>
                  <td className={styles.tdId}>{blq.id}</td>
                  <td className={styles.td} style={{ fontWeight: 600 }}>
                    {getDiaTexto(blq.diaSemana).charAt(0).toUpperCase() + getDiaTexto(blq.diaSemana).slice(1)}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.badgeTime}>
                      {blq.horaInicio} - {blq.horaFin}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.badgeCategory}>
                      {blq.categoria?.nombre || 'Sin Categoría'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => handleEdit(blq)} title="Editar" className={`${styles.iconBtn} ${styles.iconBtnEdit}`}>
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(blq.id)} title="Eliminar" className={`${styles.iconBtn} ${styles.iconBtnDelete}`}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}