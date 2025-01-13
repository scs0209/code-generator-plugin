// Add your custom hooks here when building your plugin.
// Delete this file if not needed.

import { useState, useEffect } from 'react';

export const usePlugin = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Add your plugin initialization logic here
    setIsReady(true);
  }, []);

  return { isReady };
};