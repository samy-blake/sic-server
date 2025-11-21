import { Hono } from "hono";

import put from "./put.ts";
import get from "./get.ts";
import getId from "./get-id.ts";
import postId from "./post-id.ts";
import itemDeleteId from "./item/delete-id.ts";
import itemPut from "./item/put.ts";

const app = new Hono();

app.put("/:id/item", ...itemPut);
app.delete("/:id/item/:itemId", ...itemDeleteId);

app.get("/", ...get);
app.get("/:id", ...getId);
app.put("/", ...put);
app.post("/:id", ...postId);

export { app as OwnPlaylistRoutes };
