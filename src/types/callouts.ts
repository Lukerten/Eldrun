export type CalloutKind =
  | "abstract"
  | "info"
  | "warning"
  | "danger"
  | "example"
  | "note"
  | "quote"
  | "tip"
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
