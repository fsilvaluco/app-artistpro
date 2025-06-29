import styles from './MobileTestCard.module.css';

export default function MobileTestCard() {
  return (
    <div className={styles.card}>
      <h3>📱 Modo Responsive Activado</h3>
      <p>La app ahora está optimizada para móviles:</p>
      <ul>
        <li>✅ Menú hamburguesa funcional</li>
        <li>✅ Botones touch-friendly (44px+)</li>
        <li>✅ Grids responsivos</li>
        <li>✅ Texto optimizado</li>
        <li>✅ Navegación móvil</li>
      </ul>
      <p className={styles.note}>
        Prueba cambiar el tamaño de la ventana o usar las herramientas de desarrollador para simular diferentes dispositivos.
      </p>
    </div>
  );
}
