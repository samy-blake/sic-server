import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "../../config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context, Env } from "hono";
import { JsonInputSchema } from "../../interfaces/routes.ts";

const schema = z.object({
  // name: z.string().optional(),
});

export default [
  zValidator("query", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
    };
  }(),
];
