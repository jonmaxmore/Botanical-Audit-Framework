import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'GACP Platform - Home',
};

export default function HomePage() {
  // Redirect to farmer dashboard (or login page if not authenticated)
  redirect('/farmer/dashboard');
}
