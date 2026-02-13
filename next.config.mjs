/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pokersnumber1.blob.core.windows.net",
        pathname: "/audiobook/**"
      }
    ]
  }
};

export default nextConfig;

