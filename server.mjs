import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import pino from "pino";
import app from "./dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);
const clientDir = join(process.cwd(), "dist/client");
const serverLogger = pino({
  level: process.env.LOG_LEVEL ?? "info",
});

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

function getStaticPath(pathname) {
  const normalized = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.[/\\])+/,
    "",
  );
  return join(clientDir, normalized);
}

async function serveStatic(request, response) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const filePath = getStaticPath(url.pathname);

  if (filePath !== clientDir && !filePath.startsWith(`${clientDir}${sep}`)) {
    return false;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;

    response.writeHead(200, {
      "content-length": fileStat.size,
      "content-type":
        contentTypes.get(extname(filePath)) ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
    return true;
  } catch {
    return false;
  }
}

function createWebRequest(request) {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  return new Request(url, {
    method: request.method,
    headers,
    body: hasBody ? request : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

async function writeWebResponse(webResponse, nodeResponse) {
  nodeResponse.writeHead(
    webResponse.status,
    Object.fromEntries(webResponse.headers),
  );

  if (!webResponse.body) {
    nodeResponse.end();
    return;
  }

  for await (const chunk of webResponse.body) {
    nodeResponse.write(chunk);
  }
  nodeResponse.end();
}

createServer(async (request, response) => {
  try {
    if (request.method === "GET" || request.method === "HEAD") {
      const served = await serveStatic(request, response);
      if (served) return;
    }

    const webRequest = createWebRequest(request);
    const webResponse = await app.fetch(webRequest);
    await writeWebResponse(webResponse, response);
  } catch (error) {
    serverLogger.error({ error }, "Unhandled server error");
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
}).listen(port, () => {
  serverLogger.info({ port }, "Server listening");
});
