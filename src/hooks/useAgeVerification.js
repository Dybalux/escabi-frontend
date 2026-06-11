import { useState, useEffect } from 'react';
import { showAgeVerificationToast } from '../components/UI/AgeVerificationToast';

export default function useAgeVerification({ user, loading, inMaintenance, isAdmin }) {
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Solo mostrar si NO está verificado Y el usuario NO es admin
    const isVerified = localStorage.getItem('ageVerified');
    /* Only show age toast if NOT in maintenance mode (or if admin bypasses it) */
    if (!inMaintenance && !isVerified && !isAdmin && !showBlur) {
      setShowBlur(true);
      showAgeVerificationToast(() => setShowBlur(false));
    }
  }, [user, loading, showBlur, inMaintenance, isAdmin]);

  return { showBlur };
}
