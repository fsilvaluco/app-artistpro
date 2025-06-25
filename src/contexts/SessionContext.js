"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../app/firebase";
import { useRouter } from "next/navigation";

// Crear el contexto
const SessionContext = createContext(null);

// Hook personalizado para usar el contexto
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe ser usado dentro de SessionProvider");
  }
  return context;
};

// Provider del contexto
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Log para debug
      console.log("Estado de autenticación:", user ? "Autenticado" : "No autenticado");
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión");
    }
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  // Función para obtener datos del usuario
  const getUserData = () => {
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  };

  const value = {
    user,
    loading,
    logout,
    isAuthenticated,
    getUserData
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
