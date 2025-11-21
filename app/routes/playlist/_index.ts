import { Hono } from "hono";

import get from "./get.ts";
import getId from "./get-id.ts";

const app = new Hono();

app.get("/", ...get);
app.get("/:id", ...getId);

export { app as PlaylistRoutes };
