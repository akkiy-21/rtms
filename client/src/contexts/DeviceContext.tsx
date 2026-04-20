// src/contexts/DeviceContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DeviceContextType {
  deviceId: number | null;
  setDeviceId: (id: number) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [deviceId, setDeviceId] = useState<number | undefined>(undefined);

    return (
        <DeviceContext.Provider value={{ deviceId, setDeviceId }}>
        {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};