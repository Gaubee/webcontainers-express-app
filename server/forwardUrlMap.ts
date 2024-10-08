const forwardHostMap = new Map([
  ["stackblitz.gaubee.local", "stackblitz.com"],
  ["w-corp-staticblitz.gaubee.local", "w-corp-staticblitz.com"],
  ["c-staticblitz.gaubee.local", "c.staticblitz.com"],
  ["p-staticblitz.gaubee.local", "p.stackblitz.com"],
  ["t-staticblitz.gaubee.local", "t.stackblitz.com"],
  ["nr-staticblitz.gaubee.local", "nr.stackblitz.com"],
  [
    "local-corp-webcontainer-api.gaubee.local",
    "local-corp.webcontainer-api.io",
  ],
]);

const forwardHostTransforms = [
  {
    isMatch: (host: string) =>
      host.endsWith(".w-corp-staticblitz.gaubee.local"),
    transform: (host: string) => host.replace(".gaubee.local", ".com"),
  },

  {
    isMatch: (host: string) =>
      host.endsWith(".local-corp-webcontainer-api.gaubee.local"),
    transform: (host: string) => host.replace(".local-corp-webcontainer-api.gaubee.local", ".local-corp.webcontainer-api.io"),
  },
];

export const transfomHost = (host: string) => {
  let thost = forwardHostMap.get(host);
  if (thost === undefined) {
    for (const { isMatch, transform } of forwardHostTransforms) {
      if (isMatch(host)) {
        thost = transform(host);
        break;
      }
    }
  }
  return thost ?? host;
};
