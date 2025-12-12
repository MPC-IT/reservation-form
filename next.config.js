/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  // Disable browser source maps (prevents the source map parsing errors)
  productionBrowserSourceMaps: false,

  // Force Next.js to use webpack (Pages Router stability)
  experimental: {
    turbo: false,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = 'cheap-module-source-map';
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  distDir: '.next',
};

module.exports = nextConfig;
