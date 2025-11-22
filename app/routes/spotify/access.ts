import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context, Env } from "hono";
import { JsonInputSchema } from "../../interfaces/routes.ts";
import { jwt } from "hono/jwt";
import { JWToken } from "../../interfaces/jwt.ts";
import { AccessToken } from "@spotify/web-api-ts-sdk";

const schema = z.object({
  // name: z.string().optional(),
});

export default [
  zValidator("query", schema),
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const tokenData: JWToken = c.get("jwtPayload");
      const { spotifyAccessData } = await prisma.user.findFirst({
        where: {
          id: tokenData.id,
        },
        select: {
          spotifyAccessData: true,
        },
      }) || { spotifyAccessData: null };

      if (spotifyAccessData) {
        return c.json(JSON.parse(spotifyAccessData) as AccessToken);
      } else {
        return c.body(null, 403);
      }
    };
  }(),
];
