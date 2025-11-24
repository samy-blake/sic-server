import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { jwt } from "hono/jwt";
import { Context, Env } from "hono";
import { JsonInputSchema } from "interfaces/routes.ts";
import { openApiAuthDescription } from "util/openapi.ts";

const schema = z.object({
  // name: z.string().optional(),
});

export default [
  openApiAuthDescription({
    description: "User Token Checker",
    tags: ["Auth"],
    responses: {
      200: {
        description: "token is valid",
      },
    },
  }),
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  zValidator("query", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      return c.body("", 200);
    };
  }(),
];
