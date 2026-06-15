import { useState, useEffect } from 'react';
import { showAgeVerificationToast } from '../components/UI/AgeVerificationToast';

export default function useAgeVerification({ user, loading, inMaintenance, shouldBypass }) {
  const [showBlur, setShowBlur] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Only show if NOT verified AND user is NOT bypassing
    const isVerified = localStorage.getItem('ageVerified');
    /* Only show age toast if NOT in maintenance and NOT bypassed */
    if (!inMaintenance && !isVerified && !shouldBypass && !showBlur) {
      showAgeVerificationToast(() => setShowBlur(false));
      // Defer state update to avoid sync setState in effect
      Promise.resolve().then(() => setShowBlur(true));
    }
  }, [user, loading, showBlur, inMaintenance, shouldBypass]);

  return { showBlur };
}
