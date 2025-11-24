import { Hono } from "hono";

import get from "./get.ts";
import post from "./post.ts";

const app = new Hono();

app.post("/", ...post);
app.get("/", ...get);

export { app as SpotifyRoutes };
