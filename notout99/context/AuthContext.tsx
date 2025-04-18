import React, { createContext, useContext, useState } from "react";

interface AuthContextProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <AuthContext.Provider value={{ phoneNumber, setPhoneNumber }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
