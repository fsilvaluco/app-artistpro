# 🎵 ArtistPro

Una plataforma completa de gestión para artistas musicales que incluye análisis de redes sociales, gestión de equipos, proyectos y más.

## 🚀 Características

- **📊 Análisis de Redes Sociales**: Integración con Instagram, Facebook y más
- **👥 Gestión de Equipos**: Administra tu equipo y permisos
- **📋 Gestión de Proyectos**: Kanban, Gantt y seguimiento de actividades
- **🎯 EPK Digital**: Kit de prensa electrónico
- **📱 Responsive**: Funciona en desktop y móvil
- **🔐 Autenticación**: Sistema seguro con Firebase
- **🌙 Temas**: Modo claro y oscuro

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 18
- **Backend**: Firebase (Firestore, Auth)
- **Styling**: CSS Modules
- **APIs**: Instagram Basic Display, Facebook Graph API
- **Deployment**: SiteGround

## 🏁 Inicio Rápido

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/artistpro.git
   cd artistpro
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus credenciales
   ```

4. **Ejecuta el proyecto**
   ```bash
   npm run dev
   ```

5. **Abre en el navegador**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuración

### Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication y Firestore
3. Copia las credenciales a `.env.local`

### Instagram/Facebook API
1. Crea una app en [Meta for Developers](https://developers.facebook.com/)
2. Configura Instagram Basic Display
3. Agrega las credenciales a `.env.local`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas y rutas (App Router)
│   ├── admin/             # Panel de administración
│   ├── analisis/          # Análisis de datos
│   ├── auth/              # Autenticación
│   ├── equipo/            # Gestión de equipos
│   └── ...
├── components/            # Componentes reutilizables
├── contexts/              # Contextos de React
├── utils/                 # Utilidades y helpers
└── styles/                # Estilos globales
```

## 🌐 URLs Importantes

- **Sitio web**: https://artistpro.app/
- **Política de Privacidad**: https://artistpro.app/privacy
- **Eliminación de Datos**: https://artistpro.app/data-deletion
- **Términos de Servicio**: https://artistpro.app/terms

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Email**: contact@artistpro.app
- **Website**: https://artistpro.app/

---

🎵 **Hecho con ❤️ para la comunidad musical**
