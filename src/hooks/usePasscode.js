import { useState, useCallback } from 'react';

const STORAGE_KEY = 'silo_passcode';
const PASSCODE_ENABLED_KEY = 'silo_passcode_enabled';

// Simple hash function for client-side storage (not cryptographically secure, but sufficient for local protection)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

export function usePasscode() {
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return localStorage.getItem(PASSCODE_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setPasscode = useCallback(async (passcode) => {
    try {
      const hashed = simpleHash(passcode);
      localStorage.setItem(STORAGE_KEY, hashed);
      localStorage.setItem(PASSCODE_ENABLED_KEY, 'true');
      setIsEnabled(true);
      return true;
    } catch {
      console.error('Failed to set passcode');
      return false;
    }
  }, []);

  const verifyPasscode = useCallback(async (passcode) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const hashed = simpleHash(passcode);
      return stored === hashed;
    } catch {
      console.error('Failed to verify passcode');
      return false;
    }
  }, []);

  const isPasscodeEnabled = useCallback(() => {
    try {
      return localStorage.getItem(PASSCODE_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  }, []);

  const clearPasscode = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PASSCODE_ENABLED_KEY);
      setIsEnabled(false);
      return true;
    } catch {
      console.error('Failed to clear passcode');
      return false;
    }
  }, []);

  const togglePasscode = useCallback(async (enabled) => {
    try {
      if (enabled) {
        localStorage.setItem(PASSCODE_ENABLED_KEY, 'true');
        setIsEnabled(true);
      } else {
        localStorage.removeItem(PASSCODE_ENABLED_KEY);
        localStorage.removeItem(STORAGE_KEY);
        setIsEnabled(false);
      }
      return true;
    } catch {
      console.error('Failed to toggle passcode');
      return false;
    }
  }, []);

  return {
    setPasscode,
    verifyPasscode,
    isPasscodeEnabled,
    clearPasscode,
    togglePasscode,
    isEnabled,
  };
}
