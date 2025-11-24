import { openApiAuthDescription } from "util/openapi.ts";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
import { Context, Env } from "hono";
import { JsonInputSchema } from "interfaces/routes.ts";
import { generateHash } from "util/hash.ts";
import { describeRoute } from "hono-openapi";

const schema = z.object({
  username: z.string().min(5),
  password: z.string().min(5),
  email: z.string().optional(),
});

export default [
  openApiAuthDescription({
    description: "User Login",
    tags: ["Auth"],
    responses: {
      200: {
        description: "Successful Login",
        content: {
          "application/json": {
            schema: resolver(z.object({ token: z.string() })),
          },
        },
      },
      400: {
        description: "Username is invalid",
      },
    },
  }),
  zValidator("json", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const data = c.req.valid("json");

      const auth = await prisma.user.findFirst({
        where: {
          username: data.username,
        },
      });

      if (auth) {
        c.status(400);
        return c.json({
          error: "invalid data",
        });
      }
      data.password = generateHash(data.password);
      await prisma.user.create({
        data: data,
      });

      return c.body(null, 204);
    };
  }(),
];
