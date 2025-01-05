import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "xpense", // Unique app ID
  name: "Xpense",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  retryFunction: async (attempt: any) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});
