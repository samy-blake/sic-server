import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { jwt } from "hono/jwt";
import { Context, Env } from "hono";
import { JsonInputSchema } from "../../interfaces/routes.ts";

const schema = z.object({
  // name: z.string().optional(),
});

export default [
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
