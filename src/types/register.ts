export type CommandOption = Readonly<{
  type: 3; // STRING
  name: string;
  description: string;
  required?: boolean;
}>;

export type CommandRegistration = Readonly<{
  type: 1; // CHAT_INPUT
  name: string;
  description: string;
  dm_permission?: boolean;
  default_member_permissions?: string | null;
  options?: readonly CommandOption[];
}>;

export type DefineCommandInput = Readonly<{
  name: string;
  description: string;
  dmPermission?: boolean;
  defaultMemberPermissions?: string | null;
  options?: readonly CommandOption[];
}>;
