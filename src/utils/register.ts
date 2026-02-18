import type {
  CommandOption,
  CommandRegistration,
  DefineCommandInput,
} from "../types/register";

const assertName = (name: string) => {
  if (!/^[a-z0-9_-]{1,32}$/.test(name)) {
    throw new Error(
      `Invalid command name "${name}". Use lowercase [a-z0-9_-], length 1..32.`,
    );
  }
};

const clamp = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) : s;

export const requiredString = (
  name: string,
  description: string,
): CommandOption => ({
  type: 3,
  name,
  description: clamp(description, 100),
  required: true,
});

export const optionalString = (
  name: string,
  description: string,
): CommandOption => ({
  type: 3,
  name,
  description: clamp(description, 100),
  required: false,
});

export const defineCommand = (
  input: DefineCommandInput,
): CommandRegistration => {
  assertName(input.name);

  return {
    type: 1,
    name: input.name,
    description: clamp(input.description, 100),

    ...(input.dmPermission !== undefined
      ? { dm_permission: input.dmPermission }
      : {}),

    ...(input.defaultMemberPermissions !== undefined
      ? { default_member_permissions: input.defaultMemberPermissions }
      : {}),

    ...(input.options !== undefined ? { options: input.options } : {}),
  };
};

export const defineCommands = (
  ...cmds: readonly CommandRegistration[]
): readonly CommandRegistration[] => cmds;
