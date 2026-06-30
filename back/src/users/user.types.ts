import { UserRole } from "./user-role.enum";

export type ExternalUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  createdAt: Date;
  role: UserRole;
};
