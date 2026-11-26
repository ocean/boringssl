// Unpatched @homebridge/hap-nodejs accessory. Run under the runtime being tested.
import hap from "@homebridge/hap-nodejs";
const { Accessory, Service, Characteristic, uuid, HAPStorage, Categories } = hap;
HAPStorage.setCustomStoragePath(process.env.HAP_STORE);
const acc = new Accessory("E2E Light", uuid.generate("e2e.light"));
let on = false;
acc.addService(Service.Lightbulb, "Light").getCharacteristic(Characteristic.On)
  .onGet(() => on).onSet(v => { on = !!v; console.log("SET On =", on); });
await acc.publish({ username: "17:51:07:F4:BC:8A", pincode: "678-90-876", port: 47129, bind: "0.0.0.0", category: Categories.LIGHTBULB });
console.log("PUBLISHED", process.versions.bun ? "bun " + process.versions.bun : "node " + process.versions.node);
