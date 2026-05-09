import { createServer, type Server } from "node:http";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { resolveStaticAssetPath } from "./resolve-static-asset-path.js";

const mimeTypes: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function getRequestPath(requestUrl: string): string | null {
  try {
    return new URL(requestUrl, "http://127.0.0.1").pathname;
  } catch {
    return null;
  }
}

export function createStaticRepositoryServer(
  repositoryRoot: string,
  defaultAssetPath: string,
): Server {
  return createServer((request, response) => {
    const requestPath = getRequestPath(request.url ?? "/");
    if (requestPath === null) {
      response.writeHead(403, { "Content-Type": "text/plain" });
      response.end("403 Forbidden");
      return;
    }

    const assetPath = resolveStaticAssetPath(
      repositoryRoot,
      requestPath,
      defaultAssetPath,
    );

    if (!assetPath.ok) {
      response.writeHead(assetPath.statusCode, { "Content-Type": "text/plain" });
      response.end(
        assetPath.statusCode === 403 ? "403 Forbidden" : "404 Not Found",
      );
      return;
    }

    const contentType =
      mimeTypes[extname(assetPath.absolutePath)] ?? "application/octet-stream";

    try {
      const fileContents = readFileSync(assetPath.absolutePath);
      response.writeHead(200, { "Content-Type": contentType });
      response.end(fileContents);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("404 Not Found");
    }
  });
}
