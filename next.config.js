/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  // output: 'export', // Disabled to allow API routes for AI Chat
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
};

// Setup Cloudflare dev platform in development
if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-config-utils');
      await setupDevPlatform();
    } catch {
      // Not a Cloudflare environment, skip
    }
  })();
}

module.exports = withPWA(nextConfig);

