// RFC 8439 §2.8.2 through the documented node:crypto overload.
import crypto from "node:crypto";
const h = (s: string) => Buffer.from(s.replace(/\s/g, ""), "hex");
const key = h("808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f");
const iv = h("070000004041424344454647");
const aad = h("50515253c0c1c2c3c4c5c6c7");
const pt = Buffer.from("Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.");
const ct = h("d31a8d34648e60db7b86afbc53ef7ec2a4aded51296e08fea9e2b5a736ee62d63dbea45e8ca9671282fafb69da92728b1a71de0a9e060b2905d6a5b67ecd3b3692ddbd7f2d778b8c9803aee328091b58fab324e4fad675945585808b4831d7bc3ff4def08e4b7a9de576d26586cec64b6116");
const tag = h("1ae10b594f09e26a7e902ecbd0600691");
const rt = `${process.versions.bun ? "bun " + process.versions.bun : "node " + process.versions.node}`;
try {
  console.log(rt, "getCiphers has chacha20-poly1305:", crypto.getCiphers().includes("chacha20-poly1305"));
  const c = crypto.createCipheriv("chacha20-poly1305", key, iv, { authTagLength: 16 });
  c.setAAD(aad);
  const out = Buffer.concat([c.update(pt.subarray(0, 70)), c.update(pt.subarray(70)), c.final()]);
  if (!out.equals(ct) || !c.getAuthTag().equals(tag)) throw new Error("encrypt mismatch");
  const d = crypto.createDecipheriv("chacha20-poly1305", key, iv, { authTagLength: 16 });
  d.setAAD(aad); d.setAuthTag(tag);
  if (!Buffer.concat([d.update(ct), d.final()]).equals(pt)) throw new Error("decrypt mismatch");
  const bad = crypto.createDecipheriv("chacha20-poly1305", key, iv, { authTagLength: 16 });
  bad.setAAD(aad); bad.setAuthTag(Buffer.alloc(16)); bad.update(ct);
  let threw = false; try { bad.final(); } catch { threw = true; }
  if (!threw) throw new Error("bad tag accepted");
  console.log("PASS"); process.exit(0);
} catch (e) { console.log("FAIL:", (e as Error).message); process.exit(1); }
