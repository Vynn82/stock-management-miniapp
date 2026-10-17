/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const rawUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    const backendUrl =
      rawUrl && rawUrl.startsWith('http')
        ? rawUrl
        : 'http://54.151.147.75:3000';

    return [
      {
        source: '/api-backend/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
