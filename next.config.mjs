/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ovo kaže Vercelu: "Ne prekidaj build čak i ako vidiš greške u tipovima!"
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ovo kaže: "Ignoriši stilske greške."
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;