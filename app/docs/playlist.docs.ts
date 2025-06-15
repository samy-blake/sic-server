import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

const doc = {
  getAll: describeRoute({
    description: "get all sharing is caring playlists",
    responses: {
      200: {
        description: "Successful",
        content: {
          "application/json": {
            schema: resolver(
              z.array(z.object({
                createdAt: z.string().datetime(),
                updatedAt: z.string().datetime(),
                genre: z.string(),
                id: z.string(),
                image: z.string(),
                name: z.string(),
                url: z.string(),
                _count: z.object({
                  songs: z.number(),
                }),
              })),
            ),
          },
        },
      },
    },
  }),
  getSingle: describeRoute({
    description: "get single playlist with all songs",
    responses: {
      200: {
        description: "Successful",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                id: z.string(),
                name: z.string(),
                genre: z.string(),
                image: z.string(),
                url: z.string(),
                createdAt: z.string().datetime(),
                updatedAt: z.string().datetime(),
                songs: z.array(z.object({
                  addedAt: z.string().datetime(),
                  song: z.object({
                    id: z.string(),
                    name: z.string(),
                    artists: z.string(),
                    image: z.string(),
                    createdAt: z.string().datetime(),
                    updatedAt: z.string().datetime(),
                  }),
                })),
              }),
            ),
          },
        },
      },
    },
  }),
};

export { doc as PlaylistDoc };
