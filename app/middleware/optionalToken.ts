import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";

export const optionalToken = createMiddleware(async (c, next) => {
  if (c.req.header("Bearer")) {
    const jwtMiddleware = jwt({
      secret: Deno.env.get("JWT_SECRET") || "",
    });
    await jwtMiddleware(c, next);
  } else {
    await next();
  }
});
