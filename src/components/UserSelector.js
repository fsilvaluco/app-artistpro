import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../app/firebase";
import styles from "./UserSelector.module.css";

export default function UserSelector({ onSelect, selectedUsers = [], onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, "users"), orderBy("name"));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push({ 
          id: doc.id, 
          ...userData 
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (user) => {
    onSelect(user);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Seleccionar Usuario</h3>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>
        
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.usersList}>
          {loading ? (
            <div className={styles.loading}>Cargando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.empty}>No se encontraron usuarios</div>
          ) : (
            filteredUsers.map(user => (
              <div 
                key={user.id} 
                className={`${styles.userItem} ${selectedUsers.some(u => u.id === user.id) ? styles.selected : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className={styles.userInfo}>
                  <h4>{user.name || user.email}</h4>
                  <p>{user.email}</p>
                  {user.role && <span className={styles.role}>{user.role}</span>}
                </div>
                {selectedUsers.some(u => u.id === user.id) && (
                  <div className={styles.selectedIcon}>✓</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
