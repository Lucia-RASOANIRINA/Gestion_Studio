export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  locale: "fr" | "en";
  theme: "dark" | "light" | "system";
  twoFactorEnabled: boolean;
  createdAt: string;
  roles: { name: string; description: string | null }[];
}

export interface UpdateProfileValue {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  locale?: "fr" | "en";
  theme?: "dark" | "light" | "system";
}
