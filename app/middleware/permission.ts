import { Context, Next } from "hono";
import { prisma } from "../config/db.ts";
import { JWToken } from "../interfaces/JWT.interface.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";

function checkPermission(permissionName: string, idParam?: string) {
  return async (c: Context, next: Next) => {
    // const authData = c.get("jwtPayload") as JWToken;

    // if (!authData) return c.json({ error: true, errorType: "no-auth" }, 401);

    // const authHasPermissionWhereInput: Prisma.AuthHasPermissionWhereInput = {
    //   authId: authData.id,
    //   permission: {
    //     name: permissionName,
    //   },
    // };

    // if (idParam)
    //   authHasPermissionWhereInput["objectId"] = JSON.parse(
    //     c.req.param(idParam)
    //   ) as number;

    // const permission = await prisma.authHasPermission.findFirst({
    //   where: authHasPermissionWhereInput,
    // });

    // if (!permission)
    //   return c.json({ error: true, errorType: "no-permission" }, 403);

    await next();
  };
}

export { checkPermission };
