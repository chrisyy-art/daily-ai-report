/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // mammoth 依赖 Node 内置模块，不参与打包，直接在服务端 require
    serverComponentsExternalPackages: ["mammoth"],
  },
};

export default nextConfig;
