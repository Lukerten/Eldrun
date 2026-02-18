export type InteractionType = 1 | 2 | 3 | 5;

export type InteractionOption = {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: InteractionOption[];
};

export type InteractionDataCommand = {
  name: string;
  type?: number;
  options?: InteractionOption[];
};

export type ModalTextInput = {
  type: 4;
  custom_id: string;
  value: string;
};

export type ModalComponentRow = {
  type: 1;
  components: ModalTextInput[];
};

export type InteractionDataModalSubmit = {
  custom_id: string;
  components: ModalComponentRow[];
};

export type Interaction = {
  type: InteractionType;
  id: string;
  token: string;
  channel_id: string;
  data?: InteractionDataCommand | InteractionDataModalSubmit;
};

export type InteractionResponse = {
  type: number;
  data?: any;
};
