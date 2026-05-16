import { createContext, useContext, ReactNode } from 'react';

interface LocalProfile {
  id: string;
  display_name: string;
  is_admin: boolean;
}

interface AuthContextValue {
  user: { id: string } | null;
  profile: LocalProfile | null;
  session: null;
  loading: boolean;
  signIn: (_email: string, _password: string) => Promise<string | null>;
  signUp: (_email: string, _password: string, _displayName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const localValue: AuthContextValue = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  signIn: async () => 'Authentication is disabled in local mode.',
  signUp: async () => 'Authentication is disabled in local mode.',
  signOut: async () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextValue>(localValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={localValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

