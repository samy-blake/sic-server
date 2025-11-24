import { openApiAuthDescription } from "util/openapi.ts";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context, Env } from "hono";
import { JsonInputSchema } from "interfaces/routes.ts";
import { JWToken } from "interfaces/jwt.ts";
import { jwt } from "hono/jwt";

const schema = z.object({
  name: z.string().optional(),
  creationInterval: z.enum(["DAY", "WEEK", "MONTH"]).optional(),
  creationIntervalValue: z.number().gt(0).int().optional(),
  linkedPlaylistId: z.string().optional(),
  linkedPlaylistName: z.string().optional(),

  includeSongIds: z.string().array().optional(),
  excludeSongIds: z.string().array().optional(),
});

export default [
  openApiAuthDescription({
    description: "Own Playlists",
    tags: ["Own Playlist"],
    responses: {
      200: {
        description: "update single own playlist",
        content: {
          "application/json": {
            // schema: resolver(z.object({ token: z.string() })),
          },
        },
      },
      404: {
        description: "not found",
      },
    },
  }),
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
      if (
        !await prisma.ownPlaylist.findFirst({
          where: { id: c.req.param("id") },
        })
      ) {
        return c.body(null, 404);
      }

      const tokenData: JWToken = c.get("jwtPayload");
      const body = c.req.valid("json");

      const data: Prisma.OwnPlaylistUpdateInput = {
        ...(body.creationInterval &&
          { creationInterval: body.creationInterval }),
        ...(body.creationIntervalValue &&
          { creationIntervalValue: body.creationIntervalValue }),
        ...(body.linkedPlaylistId &&
          { linkedPlaylistId: body.linkedPlaylistId }),
        ...(body.linkedPlaylistName &&
          { linkedPlaylistName: body.linkedPlaylistName }),

        ...(body.includeSongIds && {
          ownPlaylistIncludes: {
            set: body.includeSongIds.map((id) => ({ id })),
          },
        }),
        ...(body.excludeSongIds && {
          ownPlaylistExcludes: {
            set: body.excludeSongIds.map((id) => ({ id })),
          },
        }),
      };
      let playlist;
      if (Object.keys(data).length > 0) {
        playlist = await prisma.ownPlaylist.update({
          where: {
            id: c.req.param("id"),
            owner: {
              id: tokenData.id,
            },
          },
          omit: {
            ownerId: true,
          },
          data,
        });
      }
      return c.json(playlist);
    };
  }(),
];
