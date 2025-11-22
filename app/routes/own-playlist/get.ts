import { jwt } from "hono/jwt";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context, Env } from "hono";
import { JsonInputSchema } from "../../interfaces/routes.ts";
import { JWToken } from "../../interfaces/jwt.ts";

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
      };

      if (c.req.query("name")) {
        params["name"] = {
          search: c.req.query("name"),
        };
      }

      const playlists = await prisma.ownPlaylist.findMany({
        select: {
          id: true,
          linkedPlaylistId: true,
          linkedPlaylistName: true,
          provider: true,
          creationInterval: true,
          creationIntervalValue: true,
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
          ownPlaylistIncludes: {
            select: {
              _count: true,
            },
          },
          ownPlaylistExcludes: {
            select: {
              _count: true,
            },
          },
        },
        where: params,
        orderBy: {
          updatedAt: "desc",
        },
      });

      return c.json(playlists);
    };
  }(),
];
