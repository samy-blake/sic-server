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

// doc.loginEmail = describeRoute({
//   description: "User Login via email",
//   responses: {
//     200: {
//       description: "Email send",
//       content: {
//         "application/json": {
//           schema: resolver(z.object({ token: z.string() })),
//         },
//       },
//     },
//   },
// });

doc.register = describeRoute({
  description: "User Register",
  responses: {
    200: {
      description: "Successful Register",
    },
    400: {
      description: "Username is invalid",
      content: {
        "application/json": {
          schema: resolver(z.object({ error: z.string() })),
        },
      },
    },
  },
});

doc.update = describeRoute({
  description: "update login data",
  responses: {
    200: {
      description: "update successful",
    },
    400: {
      description: "username is taken or password doesnt match password check",
      content: {
        "application/json": {
          schema: resolver(z.object({ error: z.string() })),
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
