'use client';

import { useEffect, useState, useMemo } from 'react';
import { categoriasService } from '../../../services/categorias.service';
import styles from './categorias.module.css';

interface Categoria {
  id: number;
  nombre: string;
  limitePorBloque: number;
}

export default function CategoriasPage() {
  const [categoriesList, setCategoriesList] = useState<Categoria[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [idInEdit, setIdInEdit] = useState<number | null>(null);
  
  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    limitePorBloque: 0,
  });

  const [filterSearch, setFilterSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Categoria>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriasService.getCategorias();
      setCategoriesList(data);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setIdInEdit(null);
    setCategoryForm({ nombre: '', limitePorBloque: 0 });
  };

  const selectToEdit = (category: Categoria) => {
    setIsEditMode(true);
    setIdInEdit(category.id);
    setCategoryForm({
      nombre: category.nombre,
      limitePorBloque: category.limitePorBloque,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && idInEdit !== null) {
        await categoriasService.updateCategoria(idInEdit, categoryForm);
      } else {
        await categoriasService.createCategoria(categoryForm);
      }
      await loadCategories();
      resetForm();
    } catch (err) {
      console.error('Error procesando formulario de categoría:', err);
    }
  };

  const deleteCategory = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await categoriasService.deleteCategoria(id);
        await loadCategories();
      } catch (err) {
        console.error('Error eliminando categoría:', err);
      }
    }
  };

  const toggleSort = (field: keyof Categoria) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtrado y Ordenamiento procesados dinámicamente con useMemo
  const processedCategories = useMemo(() => {
    let result = [...categoriesList];

    // Búsqueda en tiempo real
    if (filterSearch.trim() !== '') {
      const query = filterSearch.toLowerCase();
      result = result.filter(
        cat =>
          cat.nombre.toLowerCase().includes(query) ||
          cat.limitePorBloque.toString().includes(query)
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [categoriesList, filterSearch, sortField, sortDirection]);

  const isFormValid = categoryForm.nombre.trim() !== '' && categoryForm.limitePorBloque > 0;

  return (
    <div className={styles.container}>
      {/* Form Card */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          {isEditMode ? '✏️ Editar Categoría' : '✨ Nueva Categoría'}
        </h3>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Nombre</label>
            <input
              type="text"
              value={categoryForm.nombre}
              onChange={e => setCategoryForm({ ...categoryForm, nombre: e.target.value })}
              className={styles.input}
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Límite por Bloque</label>
            <input
              type="number"
              value={categoryForm.limitePorBloque}
              onChange={e => setCategoryForm({ ...categoryForm, limitePorBloque: Number(e.target.value) })}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.actionsGroup}>
            <button type="submit" disabled={!isFormValid} className={styles.submitBtn}>
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </button>

            {isEditMode && (
              <button type="button" onClick={resetForm} title="Cancelar edición" className={styles.cancelBtn}>
                ❌
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        <div className={styles.tableHeader}>
          <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
            Registros Existentes
          </h3>

          <div className={styles.searchContainer}>
            <input
              type="text"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="🔍 Buscar categoría..."
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => toggleSort('id')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>ID</span>
                    <span className={styles.sortArrow}>
                      {sortField === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </span>
                  </div>
                </th>

                <th onClick={() => toggleSort('nombre')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>Nombre</span>
                    <span className={styles.sortArrow}>
                      {sortField === 'nombre' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </span>
                  </div>
                </th>

                <th onClick={() => toggleSort('limitePorBloque')} className={styles.th}>
                  <div className={styles.thContent}>
                    <span>Límite por Bloque</span>
                    <span className={styles.sortArrow}>
                      {sortField === 'limitePorBloque' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </span>
                  </div>
                </th>

                <th className={styles.th} style={{ textAlign: 'center', cursor: 'default' }}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {processedCategories.map(cat => (
                <tr key={cat.id} className={styles.tr}>
                  <td className={styles.tdId}>{cat.id}</td>
                  <td className={styles.tdNombre}>{cat.nombre}</td>
                  <td className={styles.tdLimite}>{cat.limitePorBloque}</td>

                  <td className={styles.tdActions}>
                    <button onClick={() => selectToEdit(cat)} title="Editar" className={styles.actionBtnEdit}>
                      ✏️
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} title="Eliminar" className={styles.actionBtnDelete}>
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