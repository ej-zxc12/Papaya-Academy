import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import LoadingScreen from '../components/ui/LoadingScreen';
import BodyClassProvider from './components/BodyClassProvider';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Papaya Academy, Inc. - Education for Disadvantaged Youth in the Philippines',
  description: 'Papaya Academy, Inc. provides education and opportunities for disadvantaged youth in the Philippines, helping them build a better future.',
  icons: {
    icon: '/images/papaya.jpg',
    apple: '/images/papaya.jpg',
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
        <BodyClassProvider>
          <LoadingScreen>
            {children}
          </LoadingScreen>
        </BodyClassProvider>
      </body>
    </html>
  );
}
