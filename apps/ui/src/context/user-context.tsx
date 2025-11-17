import { useContext, createContext, type ReactNode } from "react";

const UserContext = createContext({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <UserContext.Provider value={{}}>{children}</UserContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
};
