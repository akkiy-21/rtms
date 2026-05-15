import axios from 'axios';
import { DeviceConnector, DeviceConnectorCreate, DeviceConnectorUpdate } from '../types/connector';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getConnectors = async (deviceId: number): Promise<DeviceConnector[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/connectors`);
  return response.data;
};

export const createConnector = async (
  deviceId: number,
  data: DeviceConnectorCreate
): Promise<DeviceConnector> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/connectors`, data);
  return response.data;
};

export const updateConnector = async (
  deviceId: number,
  connectorId: number,
  data: DeviceConnectorUpdate
): Promise<DeviceConnector> => {
  const response = await axios.put(
    `${API_BASE_URL}/devices/${deviceId}/connectors/${connectorId}`,
    data
  );
  return response.data;
};

export const deleteConnector = async (deviceId: number, connectorId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/connectors/${connectorId}`);
};

export const triggerConnector = async (deviceId: number, connectorId: number): Promise<void> => {
  await axios.post(`${API_BASE_URL}/devices/${deviceId}/connectors/${connectorId}/trigger`);
};
