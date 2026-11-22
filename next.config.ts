import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel Blob에 업로드된 사진
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: {
      // 사진·첨부파일 업로드용. Vercel 함수 요청 한도(4.5MB) 안쪽으로 맞춘다.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
