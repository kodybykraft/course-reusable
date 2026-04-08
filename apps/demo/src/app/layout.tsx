import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Course Platform Demo',
  description: 'Demo app powered by @course packages',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
