export const metadata = {
  title: "Eliminación de Datos - ArtistPro",
  description: "Instrucciones para eliminar datos personales de ArtistPro",
};

export default function DataDeletion() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Eliminación de Datos - ArtistPro</h1>
      
      <p>
        Respetamos tu derecho a controlar tus datos personales. Si deseas eliminar tu información de ArtistPro, 
        puedes hacerlo de las siguientes maneras:
      </p>
      
      <h2>📧 Opción 1: Email</h2>
      <p>
        Envía un email a <strong>privacy@artistpro.com</strong> con:
      </p>
      <ul>
        <li>Asunto: &quot;Solicitud de eliminación de datos&quot;</li>
        <li>Tu email registrado en la plataforma</li>
        <li>Confirmación de que deseas eliminar toda tu información</li>
      </ul>
      
      <h2>⚙️ Opción 2: Desde tu cuenta</h2>
      <p>
        Si tienes acceso a tu cuenta:
      </p>
      <ol>
        <li>Inicia sesión en ArtistPro</li>
        <li>Ve a Configuración → Privacidad</li>
        <li>Haz clic en &quot;Eliminar mi cuenta y datos&quot;</li>
        <li>Confirma la acción</li>
      </ol>
      
      <h2>📋 Qué datos se eliminan</h2>
      <p>
        Cuando solicitas la eliminación, se eliminan:
      </p>
      <ul>
        <li>Tu perfil de usuario y información personal</li>
        <li>Datos de proyectos y equipos que hayas creado</li>
        <li>Conexiones a redes sociales y tokens de acceso</li>
        <li>Historial de actividad en la plataforma</li>
        <li>Cualquier contenido que hayas subido</li>
      </ul>
      
      <h2>⏱️ Tiempo de procesamiento</h2>
      <p>
        Tu solicitud será procesada en un plazo de <strong>30 días</strong> a partir de la recepción.
        Te enviaremos una confirmación cuando el proceso esté completo.
      </p>
      
      <h2>⚠️ Información importante</h2>
      <ul>
        <li>La eliminación es <strong>irreversible</strong></li>
        <li>Algunos datos pueden mantenerse por obligaciones legales</li>
        <li>Los datos compartidos con otros usuarios pueden requerir proceso adicional</li>
      </ul>
      
      <h2>🔗 Datos de redes sociales</h2>
      <p>
        Para eliminar datos obtenidos de Instagram/Facebook:
      </p>
      <ol>
        <li>La eliminación en ArtistPro removerá los datos almacenados</li>
        <li>También puedes revocar el acceso directamente en Instagram/Facebook</li>
        <li>Ve a tu configuración de Instagram/Facebook → Apps y sitios web → ArtistPro → Eliminar</li>
      </ol>
      
      <h2>📞 Contacto</h2>
      <p>
        Si tienes preguntas sobre el proceso de eliminación:
        <br />
        Email: <strong>privacy@artistpro.com</strong>
        <br />
        Respuesta típica: 24-48 horas
      </p>
      
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '8px', 
        padding: '16px', 
        marginTop: '20px' 
      }}>
        <h3>🛡️ Tu privacidad es importante</h3>
        <p>
          Nos comprometemos a proteger tu privacidad y manejar tus datos de manera responsable. 
          Esta herramienta de eliminación de datos forma parte de nuestro compromiso con la transparencia 
          y el control de datos.
        </p>
      </div>
    </div>
  );
}
