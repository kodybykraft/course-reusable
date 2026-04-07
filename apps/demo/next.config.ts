import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: [
    '@course/core',
    '@course/db',
    '@course/server',
    '@course/next',
    '@course/react',
    '@course/admin',
    '@course/ui',
  ],
};

export default config;
