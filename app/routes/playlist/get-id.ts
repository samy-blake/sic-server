import { JsonInputSchema } from "./../../interfaces/routes.ts";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context } from "hono";
import { Env } from "hono";

const schema = z.object({
  // name: z.string().optional(),
});

export default [
  // PlaylistDoc.getSingle,
  // optionalToken,
  zValidator(
    "query",
    schema,
  ),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const params: Prisma.PlaylistWhereInput = {
        id: c.req.param("id"),
      };
      // const tokenData: JWToken = c.get("jwtPayload");

      const playlist = await prisma.playlist.findFirst({
        where: params,
        include: {
          songs: {
            select: {
              addedAt: true,
              song: {
                include: {
                  tags: {
                    where: {
                      OR: [
                        {
                          owner: {
                            is: {
                              role: "ADMIN",
                            },
                          },
                        },
                        // {
                        //   owner: {
                        //     is: {
                        //       id: tokenData.id,
                        //     },
                        //   },
                        // },
                      ],
                    },
                    select: {
                      owner: {
                        select: {
                          role: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              addedAt: "asc",
            },
          },
        },
        omit: {
          createUpdateLog: true,
        },
      });

      // if (playlist?.songs) {
      //   playlist.songs = playlist?.songs.map;
      // }

      return c.json(playlist);
    };
  }(),
];
