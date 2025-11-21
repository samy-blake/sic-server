import { Hono } from "hono";

import put from "./put.ts";

const app = new Hono();

app.put("/", ...put);

export { app as UserRoutes };
