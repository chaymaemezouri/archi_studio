export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  studioId: string;
  studio: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
  };
}
