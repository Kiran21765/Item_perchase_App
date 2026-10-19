import { useCallback, useRef, useState } from 'react';

// Small helper for success / error messages. Success messages disappear after 5 seconds.
export default function useFlash() {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const flash = useCallback((text, type = 'success') => {
    clearTimeout(timer.current);
    setMsg({ text, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (type === 'success') timer.current = setTimeout(() => setMsg(null), 5000);
  }, []);

  return [msg, flash];
}
