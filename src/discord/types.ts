export type InteractionType = 1 | 2; // 1=PING, 2=APPLICATION_COMMAND

export type Interaction = {
  type: InteractionType;
  id: string;
  token: string;
  data?: {
    name: string;
    type?: number;
    options?: Array<{
      name: string;
      type: number;
      value?: string | number | boolean;
      options?: any[];
    }>;
  };
};

export type InteractionResponse = {
  type: number;
  data?: any;
};
