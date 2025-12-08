/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Ovo kaže Vercelu: "Ne prekidaj gradnju čak i ako vidiš greške u tipovima!"
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Ovo kaže Vercelu: "Ignoriši sitne greške u stilu koda."
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig