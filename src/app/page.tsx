import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirige automáticamente de la raíz al login
  redirect('/login');
}