export type Embed = Readonly<{
  title?: string;
  description?: string;
  color?: number;
}>;

export type EmbedInput = Readonly<{
  color: number;
  icon: string;
  text: string;
  title?: string;
}>;
