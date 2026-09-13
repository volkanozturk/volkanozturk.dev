/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages
  output: 'export',
  trailingSlash: true,
  images: {
    // No external image optimization — required for Cloudflare Pages
    unoptimized: true,
  },
}

module.exports = nextConfig
