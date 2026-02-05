export const mkBeastiary = (name: string, description: string) => ({
  name,
  description,
  options: [
    {
      type: 3,
      name: "title",
      description: "Entry title",
      required: true,
      max_length: 100,
    },
    {
      type: 3,
      name: "text",
      description: "Markdown entry text",
      required: true,
      max_length: 1800,
    },
  ],
});
