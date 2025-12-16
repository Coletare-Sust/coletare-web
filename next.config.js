/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"]
  },
  output: "standalone"
};

module.exports = nextConfig;
