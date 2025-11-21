import { Hono } from "hono";

import access from "./access.ts";
import userToken from "./user-token.ts";

const app = new Hono();

app.post("/user-token", ...userToken);
app.get("/access", ...access);

export { app as SpotifyRoutes };
