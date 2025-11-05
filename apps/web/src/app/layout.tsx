import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Providers } from '@/components/providers';
import { ToastProvider } from '@/components/providers/toast-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Calisthenics Platform - Transform Your Body with Bodyweight Training',
    template: '%s | Calisthenics Platform',
  },
  description:
    'Master calisthenics with our comprehensive platform. Track workouts, set goals, join the community, and transform your body with bodyweight exercises.',
  keywords: [
    'calisthenics',
    'bodyweight training',
    'fitness',
    'workout tracker',
    'exercise',
    'strength training',
    'pull-ups',
    'push-ups',
    'muscle-ups',
    'handstand',
  ],
  authors: [{ name: 'Calisthenics Platform Team' }],
  creator: 'Calisthenics Platform',
  publisher: 'Calisthenics Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Calisthenics Platform - Transform Your Body with Bodyweight Training',
    description:
      'Master calisthenics with our comprehensive platform. Track workouts, set goals, join the community, and transform your body with bodyweight exercises.',
    siteName: 'Calisthenics Platform',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Calisthenics Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calisthenics Platform - Transform Your Body with Bodyweight Training',
    description:
      'Master calisthenics with our comprehensive platform. Track workouts, set goals, join the community, and transform your body with bodyweight exercises.',
    images: ['/og-image.jpg'],
    creator: '@calisthenicsapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <ToastProvider />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
