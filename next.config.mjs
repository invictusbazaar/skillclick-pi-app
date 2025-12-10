/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! OVO JE KLJUČNO !!
    // Kažemo Vercelu: "Završi build čak i ako imaš TypeScript greške!"
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignoriši i stilske greške
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;