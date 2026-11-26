// Controller side, always under Node: pair-setup, then encrypted session calls.
import { HttpClient } from "hap-controller";
const c = new HttpClient("17:51:07:F4:BC:8A", "127.0.0.1", 47129);
await c.pairSetup("678-90-876");
console.log("PAIR-SETUP OK");
const accs = await c.getAccessories();
const svc = accs.accessories[0].services.find(s => s.characteristics.some(ch => ch.description === "On" || ch.type?.startsWith("00000025")));
const ch = svc.characteristics.find(ch => ch.type?.startsWith("00000025"));
console.log("GET /accessories OK over encrypted session, services:", accs.accessories[0].services.length);
await c.setCharacteristics({ [`1.${ch.iid}`]: true });
const r = await c.getCharacteristics([`1.${ch.iid}`]);
console.log("On after write:", r.characteristics[0].value);
process.exit(r.characteristics[0].value ? 0 : 1);
