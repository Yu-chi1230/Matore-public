import type { NextConfig } from "next";

const config: NextConfig = {
  agentRules: false,
  output: "export",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
};
export default config;
