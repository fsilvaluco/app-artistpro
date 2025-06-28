"use client";

import { useState } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { createArtistRequest } from "../../utils/artistRequests";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./page.module.css";

// Componentes para cada paso
import Step1ReclamarPerfil from "../../components/solicitud-flujo/Step1ReclamarPerfil";
import Step2DatosContacto from "../../components/solicitud-flujo/Step2DatosContacto";
import Step3TerminosCondiciones from "../../components/solicitud-flujo/Step3TerminosCondiciones";
import Step4Confirmacion from "../../components/solicitud-flujo/Step4Confirmacion";

const TOTAL_STEPS = 4;

export default function SolicitudAccesoFlujo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1
    artistName: '',
    artistId: '',
    artistUri: '',
    selectedArtist: null,
    
    // Paso 2
    firstName: '',
    lastName: '',
    businessEmail: '',
    company: '',
    role: '',
    
    // Paso 3
    acceptedTerms: false,
    
    // Estado
    isSubmitting: false,
    isCompleted: false
  });

  const { user, isAuthenticated, loading } = useSession();
  const { showSuccess, showError, showProgress, removeNotification } = useNotification();
  const router = useRouter();

  // Actualizar datos del formulario
  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Validar paso actual
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedArtist !== null;
      case 2:
        return formData.firstName.trim() && 
               formData.lastName.trim() && 
               formData.businessEmail.trim() && 
               formData.role.trim();
      case 3:
        return formData.acceptedTerms;
      default:
        return true;
    }
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Enviar solicitud
  const submitRequest = async () => {
    if (!validateCurrentStep()) return;

    let progressId;
    try {
      updateFormData({ isSubmitting: true });
      
      // Mostrar notificación de progreso
      progressId = showProgress("Enviando solicitud de acceso...", {
        title: "Procesando Solicitud"
      });

      await createArtistRequest(
        user.uid,
        user.email,
        `${formData.firstName} ${formData.lastName}`,
        formData.selectedArtist.id,
        formData.selectedArtist.name,
        `Rol: ${formData.role}, Empresa: ${formData.company || 'N/A'}, Email: ${formData.businessEmail}`
      );

      // Remover notificación de progreso
      if (progressId) removeNotification(progressId);
      
      // Mostrar éxito
      showSuccess(
        `Tu solicitud para acceder a "${formData.selectedArtist.name}" ha sido enviada correctamente.`,
        {
          title: "¡Solicitud Enviada!",
          duration: 8000,
          actions: [
            {
              label: "Ir a Mis Solicitudes",
              type: "primary",
              onClick: () => router.push('/solicitar-acceso')
            }
          ]
        }
      );

      updateFormData({ isCompleted: true });
      nextStep();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      
      // Remover notificación de progreso si existe
      if (progressId) removeNotification(progressId);
      
      // Mostrar error
      showError(
        error.message || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        {
          title: "Error al Enviar Solicitud",
          duration: 10000,
          actions: [
            {
              label: "Reintentar",
              type: "primary",
              onClick: () => submitRequest(),
              closeOnClick: true
            }
          ]
        }
      );
    } finally {
      updateFormData({ isSubmitting: false });
    }
  };

  // Cerrar flujo
  const closeFlow = () => {
    router.push('/');
  };

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Cargando...</h2>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <h2>Inicia Sesión</h2>
          <p>Debes iniciar sesión para solicitar acceso a un artista.</p>
          <button onClick={() => router.push('/')} className={styles.loginButton}>
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.flowContainer}>
        
        {/* Header del flujo */}
        <div className={styles.flowHeader}>
          <h1>Reclamar un perfil de artista</h1>
          <div className={styles.stepIndicator}>
            <span className={styles.stepText}>Paso {currentStep} de {TOTAL_STEPS}</span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className={styles.stepContent}>
          {currentStep === 1 && (
            <Step1ReclamarPerfil
              formData={formData}
              updateFormData={updateFormData}
              user={user}
              onNext={nextStep}
              isValid={validateCurrentStep()}
            />
          )}

          {currentStep === 2 && (
            <Step2DatosContacto
              formData={formData}
              updateFormData={updateFormData}
              user={user}
              onNext={nextStep}
              onPrev={prevStep}
              isValid={validateCurrentStep()}
            />
          )}

          {currentStep === 3 && (
            <Step3TerminosCondiciones
              formData={formData}
              updateFormData={updateFormData}
              onSubmit={submitRequest}
              onPrev={prevStep}
              isValid={validateCurrentStep()}
              isSubmitting={formData.isSubmitting}
            />
          )}

          {currentStep === 4 && (
            <Step4Confirmacion
              formData={formData}
              onClose={closeFlow}
            />
          )}
        </div>

        {/* Footer con información del usuario */}
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <span className={styles.userLabel}>Logueado como:</span>
            <span className={styles.userName}>{user?.displayName || user?.email}</span>
            <span className={styles.userEmail}>({user?.email})</span>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className={styles.changeAccountButton}
          >
            Cambiar de cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
