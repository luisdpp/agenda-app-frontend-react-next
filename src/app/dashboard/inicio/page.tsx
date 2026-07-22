'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '../../../services/dashboard.service';
import styles from './inicio.module.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function InicioPage() {
  const [loading, setLoading] = useState(true);
  
  const [lineChartData, setLineChartData] = useState<any>(null);
  const [doughnutChartData, setDoughnutChartData] = useState<any>(null);
  const [barChartData, setBarChartData] = useState<any>(null);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', stepSize: 1 } }
    }
  };

  useEffect(() => {
    cargarMetricasAnaliticas();
  }, []);

  const cargarMetricasAnaliticas = async () => {
    try {
      const response = await dashboardService.getMetrics();

      const metrics = response.data;

      if (metrics) {
        setLineChartData({
          labels: metrics.historicoMensual.map((m: any) => m.mes),
          datasets: [{
            data: metrics.historicoMensual.map((m: any) => m.total),
            label: 'Citas Registradas',
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          }]
        });

        setDoughnutChartData({
          labels: metrics.distribucionCategorias.map((c: any) => c.categoria),
          datasets: [{
            data: metrics.distribucionCategorias.map((c: any) => c.citas),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444']
          }]
        });

        setBarChartData({
          labels: metrics.horariosPico.map((h: any) => h.horario),
          datasets: [{
            data: metrics.horariosPico.map((h: any) => h.totalCitas),
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        });
      }
    } catch (err) {
      console.error('Error al consultar las métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <span>📊</span> Panel de Inteligencia de Negocio
          </h2>
          <p className={styles.subtitle}>
            Monitoreo en tiempo real del flujo de citas, demandas y franjas horarias picos.
          </p>
        </div>

        <div className={styles.statusBadge}>
          <span className={styles.statusDot}></span>
          PostgreSQL Conectado
        </div>
      </div>

      {/* State: Loading */}
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Compilando datos relacionales desde el servidor...</p>
        </div>
      )}

      {/* State: Data Loaded */}
      {!loading && (
        <div className={styles.grid}>
          
          {/* Gráfico 1 */}
          <div className={`${styles.card} ${styles.cardWide}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Demanda Cronológica Anual</h3>
              <p className={styles.cardSubtitle}>Volumen consolidado de citas agendadas por mes durante el año actual.</p>
            </div>
            
            <div className={styles.chartContainer}>
              {lineChartData && <Line data={lineChartData} options={lineChartOptions} />}
            </div>
          </div>

          {/* Gráfico 2 */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Participación por Servicio</h3>
              <p className={styles.cardSubtitle}>Distribución de reservas según la categoría del servicio solicitado.</p>
            </div>
            
            <div className={styles.chartContainerCenter}>
              {doughnutChartData && <Doughnut data={doughnutChartData} options={doughnutChartOptions} />}
            </div>
          </div>

          {/* Gráfico 3 */}
          <div className={`${styles.card} ${styles.cardFull}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Saturación de Franjas Horarias</h3>
              <p className={styles.cardSubtitle}>Identificación de bloques de horarios con mayor volumen de reservas acumuladas.</p>
            </div>
            
            <div className={styles.chartContainer}>
              {barChartData && <Bar data={barChartData} options={barChartOptions} />}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}