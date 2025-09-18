import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '35mb', // Tăng giới hạn lên 10 MB (tùy chỉnh nếu cần)
    },
  },
};

export default nextConfig;
