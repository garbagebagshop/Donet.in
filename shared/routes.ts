import { z } from 'zod';
import { insertUserSchema, insertDriverSchema, insertBookingSchema, insertChatSchema, users, drivers, bookings, chats } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema.extend({
        role: z.enum(["customer", "driver"]),
        // Driver specific fields if role is driver
        driverDetails: insertDriverSchema.optional(),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect & { driverProfile?: typeof drivers.$inferSelect }>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  drivers: {
    list: {
      method: 'GET' as const,
      path: '/api/drivers',
      input: z.object({
        vehicleType: z.string().optional(),
        citySector: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof drivers.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/drivers/:id',
      responses: {
        200: z.custom<typeof drivers.$inferSelect & { user: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const, // Use PATCH for partial updates
      path: '/api/drivers/:id',
      input: insertDriverSchema.partial().extend({
        isOnline: z.boolean().optional(),
      }),
      responses: {
        200: z.custom<typeof drivers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { 
          customer: typeof users.$inferSelect, 
          driver: typeof drivers.$inferSelect & { user: typeof users.$inferSelect } 
        }>()),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id',
      input: z.object({
        status: z.enum(["pending", "accepted", "rejected", "completed", "cancelled"]),
      }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    verifyDriver: {
      method: 'POST' as const,
      path: '/api/admin/verify-driver/:id',
      input: z.object({
        isVerified: z.boolean(),
      }),
      responses: {
        200: z.custom<typeof drivers.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    getPendingDrivers: {
      method: 'GET' as const,
      path: '/api/admin/pending-drivers',
      responses: {
        200: z.array(z.custom<typeof drivers.$inferSelect & { user: typeof users.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  chats: {
    list: {
      method: 'GET' as const,
      path: '/api/chats',
      query: z.object({
        bookingId: z.string(),
      }),
      responses: {
        200: z.array(z.custom<typeof chats.$inferSelect & { sender: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/chats',
      input: insertChatSchema,
      responses: {
        201: z.custom<typeof chats.$inferSelect>(),
      },
    },
  },
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
