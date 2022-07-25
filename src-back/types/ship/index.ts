type PickupInfo = "DONE" | "ALLOW" | "SOLD_OUT" | "HOLD";

const PickupInfo: { [key in PickupInfo]: PickupInfo } = Object.freeze({
  ALLOW: "ALLOW",
  SOLD_OUT: "SOLD_OUT",
  HOLD: "HOLD",
  DONE: "DONE",
});

export { PickupInfo };
