export type AuthUser = {
  id: string;
  email: string;
  name: string;
  workspace_id: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
