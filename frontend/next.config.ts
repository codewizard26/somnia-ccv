/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // ✅ enable app router
  },
};

module.exports = nextConfig;