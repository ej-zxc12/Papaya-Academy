import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-16 bg-papaya-green text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Pages Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Pages</h3>
            <ul className="space-y-3">
              {['Home', 'About Kalinga', 'Papaya School', 'Apple Project', 'Pineapple Project', 'What can you do?'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="flex items-center text-white hover:text-papaya-yellow transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-papaya-yellow flex-shrink-0" />
                    <span className="hover:underline">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* News Section */}
          <div>
            <h3 className="text-xl font-bold text-papaya-green mb-6">News</h3>
            <ul className="space-y-3">
              {['Genius', 'Kalinga Gala Dinner 2026', 'International Week', 'Happy Twins', 'Janric\'s dreams', 'This is Austin'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/news/${item.toLowerCase().replace(/\s+/g, '-')}`} 
                    className="flex items-center text-white hover:text-papaya-yellow transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 text-papaya-yellow flex-shrink-0" />
                    <span className="hover:underline">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-bold text-papaya-green mb-6">Contact Us</h3>
            <div className="space-y-3 text-white">
              <p className="font-medium">Kalinga Foundation</p>
              <p className="flex items-start">
                <svg className="w-5 h-5 text-papaya-yellow mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Kerkstraat 16, 2640 Mortsel, Belgium
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 text-papaya-yellow mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +32 3 289 02 82
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 text-papaya-yellow mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@kalinga-foundation.org
              </p>
              <div className="pt-2 mt-4 border-t border-white border-opacity-20">
                <p className="text-sm">
                  <span className="font-medium">IBAN:</span> BE 10 7350 2479 2366
                </p>
                <p className="text-sm">
                  <span className="font-medium">BIC:</span> KREDBEBB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white border-opacity-20 text-center text-white text-opacity-80 text-sm">
          <p>© {new Date().getFullYear()} Kalinga Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
