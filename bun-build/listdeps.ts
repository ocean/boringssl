const { allDeps } = await import(`${process.argv[2]}/scripts/build/deps/index.ts`);
import { createHash } from "node:crypto";
const cfg: any = { linux: true, x64: true, abi: "gnu", windows: false, darwin: false, release: true, webkitVersion: "x", webkit: "prebuilt" };
for (const d of allDeps) {
  let s: any; try { s = d.source(cfg); } catch (e) { console.error("ERR", d.name, String(e).slice(0,80)); continue; }
  if (s.kind !== "github-archive") { console.error("skip", d.name, s.kind); continue; }
  const url = `https://github.com/${s.repo}/archive/${s.commit}.tar.gz`;
  console.log([d.name, s.repo, s.commit, createHash("sha256").update(url).digest("hex").slice(0, 16)].join(" "));
}
