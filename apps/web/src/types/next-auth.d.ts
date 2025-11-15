import NextAuth from 'next-auth';

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username?: string | null;
      role?: UserRole;
      hasCompletedAssessment?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    username?: string | null;
    role?: UserRole;
    hasCompletedAssessment?: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string | null;
    role?: UserRole;
    hasCompletedAssessment?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
}