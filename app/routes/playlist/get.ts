import { openApiDescription } from "util/openapi.ts";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context } from "hono";
import { Env } from "hono";
import { JsonInputSchema } from "interfaces/routes.ts";

const schema = z.object({
  // name: z.string().optional(),
});

export default [
  openApiDescription({
    description: "Playlists",
    tags: ["Playlist"],
    responses: {
      200: {
        description: "get all playlists",
        content: {
          "application/json": {
            // schema: resolver(z.object({ token: z.string() })),
          },
        },
      },
    },
  }),
  zValidator("query", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const params: Prisma.PlaylistWhereInput = {};

      // if (c.req.query("name")) {
      //   params["name"] = {
      //     search: c.req.query("name"),
      //   };
      // }

      const playlists = await prisma.playlist.findMany({
        select: {
          createdAt: true,
          genre: true,
          id: true,
          image: true,
          name: true,
          updatedAt: true,
          _count: {
            select: {
              songs: true,
            },
          },
        },
        where: params,
        orderBy: {
          order: "asc",
        },
      });

      return c.json(playlists);
    };
  }(),
];
