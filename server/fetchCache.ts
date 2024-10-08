import fs from "node:fs";
import got, { Method } from "got";
import node_url from "node:url";
import node_path from "node:path";
import { Buffer } from "node:buffer";
import { easyProxy } from "./easyProxy.ts";
export const fetchCache = async (
  fetch_url: string,
  fetch_init: { method: string; headers: Record<string, string> }
) => {
  let http2 = false;
  if (
    fetch_url ===
    "https://7i2ng3bhau7n48bm6vsxelrk3jozau-eytk--3111--24eaa195.local-corp.webcontainer-api.io/"
  ) {
    http2 = true;
    debugger;
  }
  const CACHE_DIR = node_url.fileURLToPath(import.meta.resolve(`./fetch/`));
  const url_hash = fetch_url
    .replace("https://", "")
    .replaceAll(/[./?&=]/g, "_");
  const cache_file_path = node_path.join(CACHE_DIR, `${url_hash}.json`);
  console.log(url_hash, fs.existsSync(cache_file_path) ? "✅" : "❌");
  if (fs.existsSync(cache_file_path)) {
    const cache_fetch = JSON.parse(fs.readFileSync(cache_file_path, "utf-8"));
    if (cache_fetch.status === 200) {
      const res = new Response(Buffer.from(cache_fetch.body, "base64"), {
        status: cache_fetch.status,
        statusText: cache_fetch.statusText,
        headers: cache_fetch.headers,
      });
      return easyProxy(res, {
        url: fetch_url,
      });
    }
  }
  console.log("fetch_init.headers", fetch_init.headers);
  const res = await got(fetch_url, {
    headers: fetch_init.headers,
    method: fetch_init.method as Method,
    http2: http2,
    responseType: "buffer",
  });

  //   const res = await fetch(fetch_url, fetch_init);

  const safeHeaders = [
    ...new Map(
      [
        ...(Object.entries(res.headers) as [string, string][]),
        ["access-control-allow-origin", "*"] as const,
      ].filter(
        (item) => !(item[0] === "content-encoding" || item[0].startsWith(":"))
      )
    ),
  ];

  fs.writeFileSync(
    cache_file_path,
    JSON.stringify(
      {
        url: res.url,
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: safeHeaders,
        body: res.body.toString("base64"),
      },
      null,
      2
    )
  );
  return easyProxy(
    new Response(res.body, {
      status: res.statusCode,
      statusText: res.statusMessage,
      headers: safeHeaders,
    }),
    {
      url: fetch_url,
    }
  );
};
