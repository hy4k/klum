import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Removing "output: 'export'" to support API routes
  eslint: {
    // Remove this once we fix all ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    // Removed nodeMiddleware flag as it requires canary version
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    config.resolve.modules.push(path.resolve('./'));
    return config;
  },
};

export default nextConfig;
