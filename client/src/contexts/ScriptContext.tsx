// src/contexts/ScriptContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface ScriptContextType {
  isScriptReady: boolean;
  setScriptReady: (ready: boolean) => void;
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const ScriptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isScriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const handleScriptReady = (ready: boolean) => {
      setScriptReady(ready);
    };

    window.electronAPI.onScriptReady(handleScriptReady);

    return () => {
      window.electronAPI.removeListener('script-ready', handleScriptReady);
    };
  }, []);

  return (
    <ScriptContext.Provider value={{ isScriptReady, setScriptReady }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useScript = () => {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScript must be used within a ScriptProvider');
  }
  return context;
};