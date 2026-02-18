// src/types/routing.ts
import type { Handler } from "./runtime";

export type Cmd = Readonly<{
  name: string;
  handle: Handler;
}>;

export type Route =
  | Readonly<{ kind: "command"; key: string; handle: Handler }>
  | Readonly<{ kind: "modal"; key: string; handle: Handler }>;
