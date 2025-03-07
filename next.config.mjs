import path from 'path';

export default {
  reactStrictMode: true,
  experimental: {
    appDir: path.join(__dirname, 'client/app'),
    pagesDir: path.join(__dirname, 'client/pages'),
  },
};