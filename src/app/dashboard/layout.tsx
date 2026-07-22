'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './dashboard-layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const usuario = JSON.parse(userData);
        setUserRole(usuario.role || usuario.rol || '');
      } catch (e) {
        console.error('Error al parsear usuario desde localStorage', e);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!isClient) return null;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div>
          <h2 className={styles.brand}>Agenda</h2>

          <nav className={styles.nav}>
            {userRole === 'ADMIN' && (
              <Link
                href="/dashboard/inicio"
                className={pathname === '/dashboard/inicio' ? styles.navLinkActive : styles.navLink}
              >
                📊 Dashboard
              </Link>
            )}

            {userRole === 'ADMIN' && (
              <Link
                href="/dashboard/categorias"
                className={pathname === '/dashboard/categorias' ? styles.navLinkActive : styles.navLink}
              >
                Categorías
              </Link>
            )}

            {userRole === 'ADMIN' && (
              <Link
                href="/dashboard/bloques"
                className={pathname === '/dashboard/bloques' ? styles.navLinkActive : styles.navLink}
              >
                Bloques de Horarios
              </Link>
            )}

            <Link
              href="/dashboard/citas"
              className={pathname === '/dashboard/citas' ? styles.navLinkActive : styles.navLink}
            >
              {userRole === 'ADMIN' ? 'Control de Citas' : 'Agendar mi Cita'}
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}