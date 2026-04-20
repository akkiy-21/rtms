// useSettings.ts
import { useState, useCallback } from 'react';

export const useSettings = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const [serverIP, setServerIP] = useState('');
  const [serverPort, setServerPort] = useState('');
  const [mqttBrokerIP, setMqttBrokerIP] = useState('');
  const [mqttBrokerPort, setMqttBrokerPort] = useState('');
  const [mqttPublishInterval, setMqttPublishInterval] = useState(1);  // デフォルト値は1秒

  const loadSettings = useCallback(async () => {
    const savedServerIP = await window.electronAPI.storeGet('serverIP');
    const savedServerPort = await window.electronAPI.storeGet('serverPort');
    const savedMqttBrokerIP = await window.electronAPI.storeGet('mqttBrokerIP');
    const savedMqttBrokerPort = await window.electronAPI.storeGet('mqttBrokerPort');
    const savedMqttPublishInterval = await window.electronAPI.storeGet('mqttPublishInterval');
    
    if (savedServerIP) setServerIP(savedServerIP);
    if (savedServerPort) setServerPort(savedServerPort);
    if (savedMqttBrokerIP) setMqttBrokerIP(savedMqttBrokerIP);
    if (savedMqttBrokerPort) setMqttBrokerPort(savedMqttBrokerPort);
    if (savedMqttPublishInterval) setMqttPublishInterval(Number(savedMqttPublishInterval));
  }, []);

  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);

  const handleSaveSettings = async () => {
    await window.electronAPI.storeSet('serverIP', serverIP);
    await window.electronAPI.storeSet('serverPort', serverPort);
    await window.electronAPI.storeSet('mqttBrokerIP', mqttBrokerIP);
    await window.electronAPI.storeSet('mqttBrokerPort', mqttBrokerPort);
    await window.electronAPI.storeSet('mqttPublishInterval', mqttPublishInterval);
  
    handleCloseSettings();
  };

  return {
    openSettings,
    handleOpenSettings,
    handleCloseSettings,
    serverIP,
    setServerIP,
    serverPort,
    setServerPort,
    mqttBrokerIP,
    setMqttBrokerIP,
    mqttBrokerPort,
    setMqttBrokerPort,
    mqttPublishInterval,
    setMqttPublishInterval,
    handleSaveSettings,
    loadSettings,
  };
};