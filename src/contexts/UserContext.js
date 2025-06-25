"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where,
  orderBy 
} from "firebase/firestore";
import { db } from "../app/firebase";
import { useSession } from "./SessionContext";

// Crear el contexto
const UserContext = createContext(null);

// Hook personalizado para usar el contexto
export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers debe ser usado dentro de UserProvider");
  }
  return context;
};

// Provider del contexto
export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSession();

  // Cargar usuarios activos
  const loadUsers = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "users"),
        orderBy("displayName", "asc")
      );
      const querySnapshot = await getDocs(q);
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setLoading(false);
    }
  };

  // Crear o actualizar perfil de usuario
  const createOrUpdateUser = async (userData) => {
    if (!userData.uid) return;

    try {
      const userRef = doc(db, "users", userData.uid);
      const userDoc = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        emailVerified: userData.emailVerified,
        isActive: true,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Si es la primera vez, agregar createdAt
      if (!users.find(u => u.id === userData.uid)) {
        userDoc.createdAt = new Date().toISOString();
      }

      await setDoc(userRef, userDoc, { merge: true });
      
      // Recargar usuarios
      await loadUsers();
    } catch (error) {
      console.error("Error al crear/actualizar usuario:", error);
    }
  };

  // Cargar usuarios cuando el usuario se autentica
  useEffect(() => {
    if (user) {
      // Crear/actualizar el perfil del usuario actual
      createOrUpdateUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      });
      
      // Cargar todos los usuarios
      loadUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [user]);

  // Obtener usuarios activos (excluyendo el usuario actual si se desea)
  const getActiveUsers = (excludeCurrentUser = false) => {
    let activeUsers = users.filter(u => u.isActive !== false);
    
    if (excludeCurrentUser && user) {
      activeUsers = activeUsers.filter(u => u.id !== user.uid);
    }
    
    return activeUsers;
  };

  // Obtener usuario por ID
  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  // Obtener nombre del usuario por ID
  const getUserName = (userId) => {
    const userData = getUserById(userId);
    return userData ? (userData.displayName || userData.email) : 'Usuario desconocido';
  };

  const value = {
    users,
    loading,
    loadUsers,
    createOrUpdateUser,
    getActiveUsers,
    getUserById,
    getUserName
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
