import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "../../config/db.ts";
import { Context } from "hono";
import { Env } from "hono";
import { compareHash } from "../../util/hash.ts";
import { JWToken } from "../../interfaces/jwt.ts";
import { sign } from "hono/jwt";
import { JsonInputSchema } from "../../interfaces/routes.ts";

const schema = z.object({
  username: z.string(),
  password: z.string(),
});

export default [
  zValidator("json", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const data = c.req.valid("json");
      const auth = await prisma.user.findFirst({
        where: {
          username: data.username,
        },
      });

      if (!auth || !compareHash(data.password, auth?.password)) {
        return c.body(null, 400);
      }

      const jwtData: JWToken = {
        id: auth.id,
        username: auth.username,
        exp: Math.floor(Date.now() / 1000) + 60 * 200, // 200min
        linkedSpotify: !!auth.spotifyAccessData,
      };
      const token = await sign(
        jwtData as any,
        Deno.env.get("JWT_SECRET") || "",
      );

      return c.json({ token });
    };
  }(),
];
