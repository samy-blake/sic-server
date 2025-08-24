import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

const doc = {
  userToken: describeRoute({
    description: "save user token from spotify",
    responses: {
      200: {
        description: "Successful",
      },
      401: {
        description: "spotify login process failure",
      },
    },
  }),
};

export { doc as SpotifyDoc };
