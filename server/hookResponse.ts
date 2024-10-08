import { Buffer } from "node:buffer";
import { easyProxy } from "./easyProxy.ts";
export const hookResponse = new Map<
  (url: string) => boolean,
  (response: Response) => Promise<Response> | Response
>([
  [
    (url) =>
      !url.endsWith(".wasm") &&
      (url.includes("stackblitz") || url.includes("webcontainer")),
    (res) => {
      console.log("hook", res.url);
      // if(res.headers.get("content-type"))
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          const chunks: Uint8Array[] = [];
          res.body!.pipeTo(
            new WritableStream({
              write(data) {
                chunks.push(data);
              },
              close() {
                const htmlBinary = Buffer.concat(chunks);
                const htmlText = htmlBinary
                  .toString("utf-8")
                  //   .replaceAll(
                  //     "7i2ng3bhau7n48bm6vsxelrk3jozau-eytk.w-corp-staticblitz.com",
                  //     "7i2ng3bhau7n48bm6vsxelrk3jozau-eytk.w-corp-staticblitz.gaubee.local"
                  //   )
                  .replaceAll(
                    "w-corp-staticblitz.com",
                    "w-corp-staticblitz.gaubee.local"
                  )
                  .replaceAll("c.staticblitz.com", "c-staticblitz.gaubee.local")
                  .replaceAll("t.staticblitz.com", "t-staticblitz.gaubee.local")
                  .replaceAll(
                    "nr.staticblitz.com",
                    "nr-staticblitz.gaubee.local"
                  )
                  .replaceAll(
                    "local-corp.webcontainer-api.io",
                    "local-corp-webcontainer-api.gaubee.local"
                  )
                  //   .replaceAll(
                  //     "'.webcontainer.io'",
                  //     "'-webcontainer.gaubee.local'"
                  //   )
                  .replaceAll(
                    "'https://-staticblitz.com'",
                    "'https://-staticblitz.gaubee.local'"
                  )
                  .replaceAll(
                    "'.webcontainer-api.io'",
                    "'-webcontainer-api.gaubee.local'"
                  );

                controller.enqueue(Buffer.from(htmlText, "utf-8"));
                controller.close();
              },
              abort(reason) {
                controller.error(reason);
              },
            })
          );
        },
      });

      return easyProxy(
        new Response(body, {
          headers: res.headers,
          status: res.status,
          statusText: res.statusText,
        }),
        { url: res.url }
      );
    },
  ],
]);
