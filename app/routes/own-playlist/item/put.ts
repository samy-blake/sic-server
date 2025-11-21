import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "../../../config/db.ts";

import { Context, Env } from "hono";
import { JsonInputSchema } from "../../../interfaces/routes.ts";
import { JWToken } from "../../../interfaces/jwt.ts";
import { jwt } from "hono/jwt";

const schema = z.object({
  playlistId: z.string(),
  amount: z.number().gt(0),
});

export default [
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  zValidator("json", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const tokenData: JWToken = c.get("jwtPayload");
      const data = c.req.valid("json");
      const playlist = await prisma.ownPlaylistItem.create({
        data: {
          amount: data.amount,
          ownPlaylist: {
            connect: {
              id: c.req.param("id") as string,
              ownerId: tokenData.id,
            },
          },
          playlist: {
            connect: {
              id: data.playlistId,
            },
          },
        },
      });

      return c.json(playlist);
    };
  }(),
];
