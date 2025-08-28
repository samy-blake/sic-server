import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

const doc = {
  userToken: describeRoute({
    description: "save user token from spotify",
    responses: {
      204: {
        description: "successful",
      },
      401: {
        description: "spotify login process failure",
      },
    },
  }),
  // getPlayer: describeRoute({
  //   description: "get user spotify player state",
  //   responses: {
  //     200: {
  //       description: "Successful",
  //       content: {
  //         "application/json": {
  //           schema: resolver(z.object({
  //             device: z.object({
  //               id: z.string(),
  //               name: z.string(),
  //             }),
  //             isPlaying: z.boolean(),
  //             item: z.object({
  //               name: z.string(),
  //               artists: z.string(),
  //             }),
  //           })),
  //         },
  //       },
  //     },
  //     401: {
  //       description: "spotify login process failure",
  //     },
  //   },
  // }),
  addSongToPlaylist: describeRoute({
    description: "add track to users spotify playlist",
    responses: {
      204: {
        description: "successful",
      },
    },
  }),
  getPlaylists: describeRoute({
    description: "get all users spotify playlists",
    responses: {
      200: {
        description: "playlists",
        content: {
          "application/json": {
            schema: resolver(z.array(z.object({
              id: z.string(),
              name: z.string(),
              images: z.array(z.object({
                url: z.string(),
                height: z.number(),
                width: z.number(),
              })),
            }))),
          },
        },
      },
    },
  }),
  getAccess: describeRoute({
    description: "get spotify access data",
    responses: {
      200: {
        description: "playlists",
        content: {
          "application/json": {
            schema: resolver(z.object({
              access_token: z.string(),
              token_type: z.string(),
              expires_in: z.number(),
              refresh_token: z.string(),
              expires: z.number().optional(),
            })),
          },
        },
      },
      403: {
        description: "no access data available",
      },
    },
  }),
};

export { doc as SpotifyDoc };
