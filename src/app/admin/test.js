'use client';

import { useSession } from '../../contexts/SessionContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import Sidebar from '../../components/Sidebar';

export default function AdminPageTest() {
  const { user, loading: sessionLoading } = useSession();
  const { isAdmin, isSuperAdmin, loading: permissionsLoading } = usePermissions();

  if (sessionLoading || permissionsLoading) {
    return (
      <Sidebar>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Cargando...</h1>
          <p>Verificando permisos de administrador...</p>
        </div>
      </Sidebar>
    );
  }

  if (!user) {
    return (
      <Sidebar>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>No autenticado</h1>
          <p>Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </Sidebar>
    );
  }

  if (!isAdmin() && !isSuperAdmin()) {
    return (
      <Sidebar>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Acceso Denegado</h1>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <p>Usuario: {user.email}</p>
          <p>Es Admin: {isAdmin() ? 'Sí' : 'No'}</p>
          <p>Es Super Admin: {isSuperAdmin() ? 'Sí' : 'No'}</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div style={{ padding: '20px' }}>
        <h1>🎉 Panel de Administración</h1>
        <p>¡Acceso exitoso!</p>
        <p>Usuario: {user.email}</p>
        <p>Es Admin: {isAdmin() ? 'Sí' : 'No'}</p>
        <p>Es Super Admin: {isSuperAdmin() ? 'Sí' : 'No'}</p>
        
        <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h2>Panel de Administración Básico</h2>
          <p>Esta es una versión de prueba del panel de administración.</p>
          <p>Si puedes ver esto, significa que el acceso está funcionando correctamente.</p>
        </div>
      </div>
    </Sidebar>
  );
}
