/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    domains: ['asset-2.tribunnews.com', 'images.unsplash.com', 'awsimages.detik.net.id', 'img-global.cpcdn.com', 'www.google.com'],
  },
};

export default nextConfig;
