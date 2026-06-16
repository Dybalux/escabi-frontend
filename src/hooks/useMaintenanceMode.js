import { useState, useEffect } from 'react';
import { getSystemStatus } from '../services/system';
import { parseApiError } from '../utils/errors';

export default function useMaintenanceMode({ shouldBypass = false } = {}) {
  const [inMaintenance, setInMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Admin bypass: skip polling, no maintenance state
    if (shouldBypass) {
      setInMaintenance(false);
      setCheckingStatus(false);
      return;
    }

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
              parseApiError(error).detail ||
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

    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [shouldBypass]);

  return { inMaintenance, maintenanceMsg, checkingStatus };
}
