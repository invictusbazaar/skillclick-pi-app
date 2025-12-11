/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! UPOZORENJE !!
    // Ovo dozvoljava da se završi build čak i ako postoje TS greške.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ovo dozvoljava da se završi build čak i ako postoje ESLint greške.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;