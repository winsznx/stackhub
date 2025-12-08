import { z } from 'zod';

const configSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3001'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_STACKS_NETWORK: z.enum(['mainnet', 'testnet', 'devnet']).default('testnet'),
});

const _env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STACKS_NETWORK: process.env.NEXT_PUBLIC_STACKS_NETWORK,
};

const result = configSchema.safeParse(_env);

if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    // In production, we might want to throw, but for now we'll log error and potentially crash if critical
    if (process.env.NODE_ENV === 'production') {
        throw new Error("Invalid environment variables");
    }
}

export const env = result.success ? result.data : configSchema.parse({});
