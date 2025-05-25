import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import { jwt as jwtMiddleWare, sign } from "hono/jwt";
import { z } from "zod";
import "zod-openapi/extend";

import { prisma } from "../config/db.ts";
import { AuthDoc } from "../docs/auth.docs.ts";
import { JWToken } from "../interfaces/JWT.interface.ts";
import { compareHash } from "../util/hash.ts";

const app = new Hono();

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

app.post(
  "/login",
  AuthDoc.login,
  zValidator("json", loginSchema),
  async (c) => {
    const data = c.req.valid("json");
    const auth = await prisma.auth.findFirst({
      where: {
        username: data.username,
      },
    });

    if (!auth || !compareHash(data.password, auth?.password)) {
      return c.json({}, 400);
    }

    const jwtData: JWToken = {
      id: auth.id,
      username: auth.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 200, // 200min
    };
    const token = await sign(jwtData as any, Deno.env.get("JWT_SECRET") || "");

    return c.json({ token });
  }
);

app.get(
  "/check",
  jwtMiddleWare({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  AuthDoc.check,
  async (c) => {
    return c.body("", 200);
  }
);

export { app as AuthRoutes };
