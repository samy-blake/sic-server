import { JWToken } from "../../interfaces/jwt.ts";
import { jwt } from "hono/jwt";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

import { prisma } from "config/db.ts";
import { Context } from "hono";
import { generateHash } from "../../util/hash.ts";
import { Env } from "hono";
import { JsonInputSchema } from "../../interfaces/routes.ts";

const schema = z.object({
  username: z.string(),
}).or(z.object({
  password: z.string(),
  passwordCheck: z.string(),
})).or(z.object({
  username: z.string(),
  password: z.string(),
  passwordCheck: z.string(),
}));

export default [
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  zValidator("json", schema),
  // AuthDoc.update,
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const data = c.req.valid("json");
      if ("password" in data && "passwordCheck" in data) {
        if (data.password !== data.passwordCheck) {
          c.status(400);
          return c.json({ error: "password not match" });
        }

        data.password = generateHash(data.password);
      }

      if ("username" in data) {
        const usernameCheck = await prisma.user.findFirst({
          where: {
            username: data.username,
          },
        });

        if (usernameCheck) {
          c.status(400);
          return c.json({ error: "username is taken" });
        }
      }

      const tokenData: JWToken = c.get("jwtPayload");

      await prisma.user.update({
        where: {
          id: tokenData.id,
        },
        data: {
          ...("password" in data && { password: data.password }),
          ...("username" in data && { username: data.username }),
        },
      });

      return c.body(null, 200);
    };
  }(),
];
