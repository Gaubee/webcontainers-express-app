import http from "node:http";
import https from "node:https";
import tls from "node:tls";
import fs from "node:fs";
import node_url from "node:url";
import node_path from "node:path";
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { hookResponse } from "./hookResponse.ts";
import { easyProxy } from "./easyProxy.ts";
import { transfomHost } from "./forwardUrlMap.ts";
import { fetchCache } from "./fetchCache.ts";
const html = String.raw;
const readFile = (file_path: string) =>
  fs.readFileSync(node_url.fileURLToPath(import.meta.resolve(file_path)));
const gaubee_local_pems = {
  key: readFile("./_wildcard.gaubee.local-key.pem"),
  cert: readFile("./_wildcard.gaubee.local.pem"),
};
const w_corp_staticblitz_gaubee_local_pems = {
  key: readFile("./_wildcard.w-corp-staticblitz.gaubee.local-key.pem"),
  cert: readFile("./_wildcard.w-corp-staticblitz.gaubee.local.pem"),
};
const local_corp_webcontainer_api_gaubee_local_pems = {
  key: readFile("./_wildcard.local-corp-webcontainer-api.gaubee.local-key.pem"),
  cert: readFile("./_wildcard.local-corp-webcontainer-api.gaubee.local.pem"),
};
const server = https.createServer(
  {
    // ...gaubee_local_pems,
    SNICallback: (serverName, cb) => {
      console.log("serverName", serverName);
      if (serverName.endsWith(".w-corp-staticblitz.gaubee.local")) {
        cb(null, tls.createSecureContext(w_corp_staticblitz_gaubee_local_pems));
      } else if (
        serverName.endsWith(".local-corp-webcontainer-api.gaubee.local")
      ) {
        cb(
          null,
          tls.createSecureContext(local_corp_webcontainer_api_gaubee_local_pems)
        );
      } else {
        cb(null, tls.createSecureContext(gaubee_local_pems));
      }
    },
  },
  async (req, res) => {
    const host = req.headers.host ?? "";
    const forwardHost = transfomHost(host);
    console.log("req", req.method, req.headers.host, req.url, forwardHost);
    if (forwardHost === undefined) {
      res.setHeader("Content-Type", "text/html");
      res.end(html`<h1>[${req.method}] ${req.url}</h1>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>`);
      return;
    }
    const x_headers = { ...req.headers, host: forwardHost } as any as Record<
      string,
      string
    >;
    if (forwardHost.endsWith(".local-corp.webcontainer-api.io")) {
      x_headers["sec-fetch-mode"] = "navigate";
    }
    const x_response = await fetchCache(`https://${forwardHost}${req.url}`, {
      method: req.method!,
      headers: x_headers,
    });
    await responseToServerResponse(x_response, res);
  }
);

const responseToServerResponse = async (
  x_response: Response,
  res: http.ServerResponse<http.IncomingMessage>
) => {
  for (const [match, hook] of hookResponse) {
    if (match(x_response.url)) {
      x_response = await hook(x_response);
      break;
    }
  }
  return new Promise<void>((resolve, reject) => {
    res.statusCode = x_response.status;
    x_response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const x_body = x_response.body;
    if (x_body === null) {
      res.end();
      resolve();
    } else {
      x_body.pipeTo(
        new WritableStream({
          write(data) {
            res.write(data);
          },
          close() {
            res.end();
            resolve();
          },
          abort(reason) {
            reject(reason);
            res.end();
          },
        })
      );
    }
  });
};

server.listen(443, () => {
  console.log("server ready", server.address());
});
