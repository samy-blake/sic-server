import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import type { JwtVariables } from "hono/jwt";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { prisma } from "../config/db.ts";
import { checkPermission } from "../middleware/permission.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { CustomerDoc } from "../docs/customer.docs.ts";
type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();
app.use(
  "*",
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  })
);

const getAllQuerySchema = z.object({
  name: z.string().optional(),
});
app.get(
  "/",
  CustomerDoc.getAll,
  zValidator("query", getAllQuerySchema),
  checkPermission("customer.read.*"),
  async (c) => {
    const params: Prisma.CustomerWhereInput = {};

    if (c.req.query("name")) {
      params["name"] = {
        search: c.req.query("name"),
      };
    }

    const customers = await prisma.customer.findMany({
      where: params,
      select: {
        id: true,
        name: true,
        delete: true,
        location: false,
        projects: false,
        createdAt: true,
        updatedAt: true,
        images: true,
      },
    });

    return c.json({ customers });
  }
);

app.get(
  "/:id",
  CustomerDoc.getSingle,
  checkPermission("customer.read.*"),
  async (c) => {
    const params: Prisma.CustomerWhereInput = {
      id: JSON.parse(c.req.param("id")),
    };

    const customer = await prisma.customer.findFirst({
      where: params,
      select: {
        id: true,
        images: true,
        name: true,
        delete: true,
        createdAt: true,
        updatedAt: true,
        location: true,
        projects: {
          select: {
            project: true,
          },
        },
      },
    });

    return c.json({ customer });
  }
);

const createSchema = z.object({
  name: z.string(),
  locationId: z.number().optional(),
  images: z.string().optional(),
});

app.post(
  "/",
  CustomerDoc.create,
  zValidator("json", createSchema),
  checkPermission("customer.create.*"),
  async (c) => {
    const data: any = c.req.valid("json");

    if (data.locationId) {
      data.location = {
        connect: {
          id: data.locationId,
        },
      };
      delete data.locationId;
    }

    const customer = await prisma.customer.create({
      data,
      include: {
        location: true,
        projects: true,
      },
    });

    return c.json({ customer });
  }
);

const updateSchema = z.object({
  name: z.string().optional(),
  locationId: z.number().optional(),
  images: z.string().optional(),
});
app.put(
  "/:id",
  CustomerDoc.update,
  zValidator("json", updateSchema),
  checkPermission("customer.update.*"),
  async (c) => {
    const data: any = c.req.valid("json");

    if (data.locationId) {
      data.location = {
        connect: {
          id: data.locationId,
        },
      };
      delete data.locationId;
    }

    const customer = await prisma.customer.update({
      where: {
        id: JSON.parse(c.req.param("id")) as number,
      },
      data,
      include: {
        location: true,
        projects: true,
      },
    });

    return c.json({ customer });
  }
);

app.delete(
  "/:id",
  CustomerDoc.delete,
  checkPermission("customer.delete.*"),
  async (c) => {
    const cust = await prisma.customer.findUnique({
      where: {
        id: JSON.parse(c.req.param("id")) as number,
      },
    });

    if (cust) {
      const customer = await prisma.customer.update({
        where: {
          id: cust.id,
        },
        data: {
          delete: !cust.delete,
        },
        include: {
          location: true,
          projects: true,
        },
      });
      return c.json({ customer });
    } else {
      c.status(404);
      return c.json({});
    }
  }
);

export { app as CustomerRoutes };
