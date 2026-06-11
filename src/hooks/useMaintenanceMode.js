import { useState, useEffect } from 'react';
import { getSystemStatus } from '../services/api';

export default function useMaintenanceMode({ skipPathPrefix = '/admin' } = {}) {
  const [inMaintenance, setInMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getSystemStatus();

        if (response.data?.maintenance_mode) {
          setInMaintenance(true);
          setMaintenanceMsg(response.data.message || 'Estamos realizando mejoras. Volvemos pronto.');
        } else {
          setInMaintenance(false);
        }
      } catch (error) {
        // Si recibimos un 503, significa que el servidor está en mantenimiento
        if (error.response?.status === 503) {
          setInMaintenance(true);
          setMaintenanceMsg(
            error.response?.data?.message ||
            'Estamos realizando mejoras. Volvemos pronto.'
          );
        } else {
          // En caso de otro error, permitir acceso normal
          setInMaintenance(false);
        }
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();

    // Verificar cada 30 segundos (solo si NO es admin)
    const interval = setInterval(() => {
      // No verificar si estamos en rutas de admin
      if (!window.location.pathname.startsWith(skipPathPrefix)) {
        checkStatus();
      }
    }, 30000); // 30 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  return { inMaintenance, maintenanceMsg, checkingStatus };
}
