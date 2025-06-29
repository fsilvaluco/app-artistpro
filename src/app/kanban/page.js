'use client';

import { useSession } from '../../contexts/SessionContext';
import PermissionGuard from '../../components/PermissionGuard';
import Sidebar from '../../components/Sidebar';
import Kanban from '../../components/Kanban';

export default function KanbanPage() {
  const { user } = useSession();

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <Sidebar>
      <PermissionGuard requiredPermission="kanban_view">
        <div>
          <h1>Gestión Kanban</h1>
          <Kanban />
        </div>
      </PermissionGuard>
    </Sidebar>
  );
}
