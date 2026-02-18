// src/types/callouts.ts

export type CalloutKind =
  | "abstract"
  | "info"
  | "warning"
  | "danger"
  | "example"
  | "success";

export type CalloutStyle = Readonly<{
  icon: string;
  color: number;
}>;

export type ParsedCallout = Readonly<{
  icon: string;
  color: number;
  title?: string;
  text: string;
}>;
