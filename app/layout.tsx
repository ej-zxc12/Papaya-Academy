import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Montserrat } from 'next/font/google'

// Configure the font with the weights you need (Light, Regular, Bold)
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat', // Optional: for Tailwind config
})

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Papaya Academy, Inc. - Education for Disadvantaged Youth in the Philippines',
  description: 'Papaya Academy, Inc. provides education and opportunities for disadvantaged youth in the Philippines, helping them build a better future.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
