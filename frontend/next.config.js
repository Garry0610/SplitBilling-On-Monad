/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // @wagmi/connectors's Base/Coinbase Smart Wallet connector pulls in
    // @base-org/account -> @coinbase/cdp-sdk, which has several internal
    // '@x402/...' subpath imports that aren't reliably resolvable in every
    // dependency combo. We never use the Coinbase Smart Wallet connector or
    // x402 payments in this app, so we stub the whole chain out at the
    // top rather than patching each broken subpath one at a time.
    config.resolve.alias["@base-org/account"] = false;
    config.resolve.alias["@coinbase/cdp-sdk"] = false;
    return config;
  },
};

module.exports = nextConfig;