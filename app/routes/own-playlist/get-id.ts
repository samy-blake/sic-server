import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context, Env } from "hono";
import { jwt } from "hono/jwt";
import { JWToken } from "../../interfaces/jwt.ts";
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
      const tokenData: JWToken = c.get("jwtPayload");
      const params: Prisma.OwnPlaylistWhereInput = {
        ownerId: tokenData.id,
        id: c.req.param("id") as string,
      };

      const playlist = await prisma.ownPlaylist.findFirst({
        where: params,
        omit: {
          ownerId: true,
        },
        include: {
          items: {
            select: {
              id: true,
              playlist: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              amount: true,
              createdAt: true,
            },
          },
          ownPlaylistExcludes: true,
          ownPlaylistIncludes: true,
        },
      });

      return c.json(playlist);
    };
  }(),
];
