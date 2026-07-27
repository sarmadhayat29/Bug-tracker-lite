/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the shared workspace package so Next.js can process its TypeScript
  transpilePackages: ['@bug-tracker/shared'],
  output: 'export',
  images: {
    // Allow Supabase Storage images
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
