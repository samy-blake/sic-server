import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

const doc: any = {};

const Single = z.object({
  id: z.number(),
  name: z.string(),
  delete: z.boolean(),
  location: z
    .object({
      id: z.number(),
      name: z.string(),
      street: z.string(),
      number: z.string(),
      venue: z.string(),
      postcode: z.string(),
      images: z.string(),
      delete: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .optional(),
  projects: z
    .object({
      project: z.object({
        id: z.number(),
        title: z.string(),
        begin: z.string().datetime(),
        end: z.string().datetime(),
        fallback_contact_person: z.string(),
        fallback_customer_person: z.string(),
        task: z.string(),
        arrival: z.string(),
        additional_information: z.string(),
        delete: z.boolean(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      }),
    })
    .array(),
});

doc.getAll = describeRoute({
  description: "get all customers",
  responses: {
    200: {
      description: "Successful",
      content: {
        "application/json": {
          schema: resolver(
            z.object({
              customers: z
                .object({
                  id: z.number(),
                  name: z.string(),
                  delete: z.boolean(),
                })
                .array(),
            })
          ),
        },
      },
    },
  },
});

doc.getSingle = describeRoute({
  description: "get single customer",
  responses: {
    200: {
      description: "Successful",
      content: {
        "application/json": {
          schema: resolver(
            z.object({
              customer: Single,
            })
          ),
        },
      },
    },
  },
});

doc.create = describeRoute({
  description: "create customer",
  responses: {
    200: {
      description: "Successful",
      content: {
        "application/json": {
          schema: resolver(
            z.object({
              customer: Single,
            })
          ),
        },
      },
    },
  },
});

doc.update = describeRoute({
  description: "update customer",
  responses: {
    200: {
      description: "Successful",
      content: {
        "application/json": {
          schema: resolver(
            z.object({
              customer: Single,
            })
          ),
        },
      },
    },
  },
});

doc.delete = describeRoute({
  description: "set delete flag on customer",
  responses: {
    200: {
      description: "Successful",
      content: {
        "application/json": {
          schema: resolver(
            z.object({
              customer: Single,
            })
          ),
        },
      },
    },
  },
});

export { doc as CustomerDoc };
