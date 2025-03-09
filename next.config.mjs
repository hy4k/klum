import path from 'path';
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: path.join('client', '.next'),
  dir: 'client',
  
  // പെർഫോമൻസ് ഒപ്റ്റിമൈസേഷൻസ്
  experimental: {
    swcLoader: true,
    forceSwcTransforms: true,
    // ആധുനിക ഫീച്ചറുകൾ
    serverActions: true,
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  
  swcMinify: true,
  
  // ഇമേജ് ഒപ്റ്റിമൈസേഷൻ
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // വെബ്പാക്ക് കോൺഫിഗറേഷൻ
  webpack: (config, { isServer }) => {
    // Ensure config.experiments exists
    config.experiments = config.experiments || {};
    
    // Add async WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true
    };

    // Add fallbacks for non-server environment
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false
      };
    }

    return config;
  },
  
  // എൻവയോൺമെന്റ് വേരിയബിൾസ്
  env: {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  
  // പെർഫോമൻസ് ഇൻഡിക്കേറ്റർ
  devIndicators: {
    buildActivity: true,
  },
  
  // പവർഫുൾ കാഷിംഗ്
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
}

export default nextConfig;