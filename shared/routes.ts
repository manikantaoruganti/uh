import { z } from 'zod';
import { adiScoreSchema, regionSchema, timelinePointSchema, patternSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  regions: {
    list: {
      method: 'GET' as const,
      path: '/api/regions',
      responses: {
        200: z.array(regionSchema),
      },
    },
  },
  adi: {
    get: {
      method: 'GET' as const,
      path: '/api/adi',
      input: z.object({
        state: z.string().optional(),
        district: z.string().optional(),
        pincode: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(adiScoreSchema),
      },
    },
  },
  timeline: {
    get: {
      method: 'GET' as const,
      path: '/api/timeline',
      input: z.object({
        state: z.string().optional(),
        district: z.string().optional(),
        pincode: z.string().optional(),
      }),
      responses: {
        200: z.array(timelinePointSchema),
      },
    },
  },
  patterns: {
    list: {
      method: 'GET' as const,
      path: '/api/patterns/:type',
      responses: {
        200: z.array(patternSchema),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
