/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/api-client', '@repo/shared', '@repo/types'],
};

export default nextConfig;
