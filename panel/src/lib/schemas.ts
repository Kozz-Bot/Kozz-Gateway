import { z } from 'zod';

export const gatewayResourceSchema = z.object({
	resource: z.string().min(1),
	data: z.record(z.string(), z.unknown()).default({}),
});

export const dispatchSchema = z.object({
	event: z.string().min(1),
	payload: z.unknown(),
});

export const signatureSchema = z.string().min(32);

export type GatewayResourceRequest = z.infer<typeof gatewayResourceSchema>;
export type DispatchRequest = z.infer<typeof dispatchSchema>;
