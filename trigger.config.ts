import type { TriggerConfig } from "@trigger.dev/sdk/v3";

export const config: TriggerConfig = {
  project: "proj_tbrpbqhkcysnoewvtlau",
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  triggerDirectories: ["trigger"],
  additionalFiles: ["./prisma/schema.prisma"],
  additionalPackages: ["prisma@5.16.1"],
};
