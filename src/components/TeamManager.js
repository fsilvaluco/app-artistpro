"use client";

import { useState } from "react";
import { TEAM_ROLES, getRoleColor, getRoleLabel } from "../utils/teamManagement";
import styles from "./TeamManager.module.css";

export default function TeamManager({
  teamMembers,
  showAddForm,
  editingMember,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onCancelAdd,
  onStartEdit,
  onCancelEdit
}) {
  const [viewMode, setViewMode] = useState("grid"); // grid, list, table

  return (
    <div className={styles.teamManager}>
      {/* Controles superiores */}
      <div className={styles.controls}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{teamMembers.length}</span>
            <span className={styles.statLabel}>Miembros</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {teamMembers.filter(m => m.status === 'active').length}
            </span>
            <span className={styles.statLabel}>Activos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {new Set(teamMembers.map(m => m.role)).size}
            </span>
            <span className={styles.statLabel}>Roles</span>
          </div>
        </div>

        <div className={styles.viewControls}>
          <button
            onClick={() => setViewMode("grid")}
            className={`${styles.viewButton} ${viewMode === "grid" ? styles.active : ""}`}
          >
            🔲 Tarjetas
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`${styles.viewButton} ${viewMode === "list" ? styles.active : ""}`}
          >
            📋 Lista
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`${styles.viewButton} ${viewMode === "table" ? styles.active : ""}`}
          >
            📊 Tabla
          </button>
        </div>
      </div>

      {/* Formulario de agregar/editar */}
      {(showAddForm || editingMember) && (
        <TeamMemberForm
          member={editingMember}
          onSubmit={editingMember ? 
            (data) => onEditMember(editingMember.id, data) : 
            onAddMember
          }
          onCancel={editingMember ? onCancelEdit : onCancelAdd}
        />
      )}

      {/* Lista de miembros */}
      {teamMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>👥 No hay miembros en el equipo</h3>
          <p>Agrega el primer miembro para comenzar a gestionar tu equipo.</p>
        </div>
      ) : (
        <div className={`${styles.membersList} ${styles[viewMode]}`}>
          {viewMode === "table" ? (
            <TeamMembersTable
              members={teamMembers}
              onEdit={onStartEdit}
              onDelete={onDeleteMember}
            />
          ) : (
            teamMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                viewMode={viewMode}
                onEdit={() => onStartEdit(member)}
                onDelete={() => onDeleteMember(member.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Componente para formulario de miembro
function TeamMemberForm({ member, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    role: member?.role || "other",
    department: member?.department || "",
    startDate: member?.startDate ? 
      new Date(member.startDate).toISOString().split('T')[0] : "",
    salary: member?.salary || "",
    status: member?.status || "active",
    notes: member?.notes || "",
    emergency_contact: member?.emergency_contact || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      salary: formData.salary ? parseFloat(formData.salary) : null
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.formOverlay}>
      <form className={styles.memberForm} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h3>{member ? "✏️ Editar Miembro" : "➕ Agregar Miembro"}</h3>
          <button type="button" onClick={onCancel} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
            >
              {TEAM_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Departamento</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Fecha de Inicio</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Salario (USD)</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => handleChange("salary", e.target.value)}
              min="0"
              step="100"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Estado</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="active">✅ Activo</option>
              <option value="inactive">⏸️ Inactivo</option>
              <option value="suspended">🚫 Suspendido</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Contacto de Emergencia</label>
            <input
              type="text"
              value={formData.emergency_contact}
              onChange={(e) => handleChange("emergency_contact", e.target.value)}
              placeholder="Nombre - Teléfono"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows="3"
              placeholder="Información adicional sobre el miembro..."
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton}>
            {member ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para tarjeta de miembro
function TeamMemberCard({ member, viewMode, onEdit, onDelete }) {
  const roleColor = getRoleColor(member.role);
  const roleLabel = getRoleLabel(member.role);

  return (
    <div className={`${styles.memberCard} ${styles[viewMode]} ${styles[member.status]}`}>
      <div className={styles.memberHeader}>
        <div className={styles.memberPhoto}>
          {member.photo ? (
            <img src={member.photo} alt={member.name} />
          ) : (
            <div className={styles.photoPlaceholder}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.memberInfo}>
          <h4>{member.name}</h4>
          <span 
            className={styles.roleTag} 
            style={{ backgroundColor: roleColor + "20", color: roleColor }}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      <div className={styles.memberDetails}>
        {member.email && (
          <div className={styles.detail}>
            <span className={styles.icon}>📧</span>
            <span>{member.email}</span>
          </div>
        )}
        {member.phone && (
          <div className={styles.detail}>
            <span className={styles.icon}>📞</span>
            <span>{member.phone}</span>
          </div>
        )}
        {member.department && (
          <div className={styles.detail}>
            <span className={styles.icon}>🏢</span>
            <span>{member.department}</span>
          </div>
        )}
        {member.startDate && (
          <div className={styles.detail}>
            <span className={styles.icon}>📅</span>
            <span>
              Desde {new Date(member.startDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {member.salary && (
          <div className={styles.detail}>
            <span className={styles.icon}>💰</span>
            <span>${member.salary.toLocaleString()}/mes</span>
          </div>
        )}
      </div>

      <div className={styles.memberActions}>
        <button onClick={onEdit} className={styles.editButton}>
          ✏️ Editar
        </button>
        <button onClick={onDelete} className={styles.deleteButton}>
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

// Componente para tabla de miembros
function TeamMembersTable({ members, onEdit, onDelete }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.membersTable}>
        <thead>
          <tr>
            <th>Miembro</th>
            <th>Rol</th>
            <th>Departamento</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} className={styles[member.status]}>
              <td>
                <div className={styles.memberCell}>
                  <div className={styles.memberPhoto}>
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} />
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span>{member.name}</span>
                </div>
              </td>
              <td>
                <span 
                  className={styles.roleTag} 
                  style={{ 
                    backgroundColor: getRoleColor(member.role) + "20", 
                    color: getRoleColor(member.role) 
                  }}
                >
                  {getRoleLabel(member.role)}
                </span>
              </td>
              <td>{member.department || "-"}</td>
              <td>{member.email || "-"}</td>
              <td>{member.phone || "-"}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[member.status]}`}>
                  {member.status === 'active' ? '✅ Activo' : 
                   member.status === 'inactive' ? '⏸️ Inactivo' : 
                   '🚫 Suspendido'}
                </span>
              </td>
              <td>
                <div className={styles.tableActions}>
                  <button onClick={() => onEdit(member)} className={styles.editButton}>
                    ✏️
                  </button>
                  <button onClick={() => onDelete(member.id)} className={styles.deleteButton}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
