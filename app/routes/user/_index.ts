import { Hono } from "hono";

import post from "./post.ts";

const app = new Hono();

app.post("/", ...post);

export { app as UserRoutes };
