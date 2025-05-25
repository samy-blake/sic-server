import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import "zod-openapi/extend";

const doc: any = {};

doc.login = describeRoute({
  description: "User Login",
  responses: {
    200: {
      description: "Successful Login",
      content: {
        "application/json": {
          schema: resolver(z.object({ token: z.string() })),
        },
      },
    },
  },
});
doc.check = describeRoute({
  description: "User Token Checker",
  responses: {
    200: {
      description: "token is valid",
    },
    403: {
      description: "token is invalid",
    },
  },
});

export { doc as AuthDoc };
