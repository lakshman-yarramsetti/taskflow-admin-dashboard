import { useEffect, useState } from 'react';

export function useToast(duration = 3000) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => {
      setMessage('');
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, message]);

  return {
    toastMessage: message,
    showToast: setMessage,
    clearToast: () => setMessage(''),
  };
}
