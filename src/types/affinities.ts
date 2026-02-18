export type Element =
  | "Physical"
  | "Fire"
  | "Air"
  | "Bolt"
  | "Ice"
  | "Earth"
  | "Light"
  | "Dark"
  | "Poison";

export type Affinity = "Weakness" | "Resistance" | "Immunity" | "Absorption";

export type AffinityEntry = Readonly<{
  element: Element;
  affinity: Affinity;
}>;
