// api.ts
import axios from 'axios';
import { Device, DeviceFormData } from '../types/device';
import { Classification, ClassificationGroup, ClassificationUpdate } from '../types/classification';
import { PLCFormDataWithAddressRanges, PLCWithAddressRanges, AddressRange } from '../types/plc';
import { TimeTable, TimeTableRequest } from '../types/timeTable';
import { Customer, CustomerFormData } from '../types/customer';
import { Product, ProductFormData, ProductWithCustomer } from '../types/product';
import { User, UserFormData } from '../types/user';
import { Client, ClientFormData } from '../types/client';
import { EfficiencyAddress } from '../types/efficiency';
import { EfficiencyAddressFormData } from '../components/features/efficiency/efficiency-address-form-schema';
import { AlarmGroup, AlarmGroupFormData, AlarmAddress, AlarmAddressFormData } from '../types/alarm';
import { LoggingSetting, LoggingSettingFormData, LoggingDataSettingFormData, LoggingDataSetting } from '../types/logging';
import { QualityControlSignal, QualityControlSignalFormData, QualityControlSignalCreateData, QualityControlSignalUpdateData } from '../types/qualityControl';
import { DeviceProductAssociation } from '../types/deviceProductAssociation';


// 開発環境では localhost、本番環境では環境変数から取得
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'; 

// device
export const getDevices = async (): Promise<Device[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices`);
  return response.data;
};

export const getDevice = async (id: number): Promise<Device> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${id}`);
  return response.data;
};

export const createDevice = async (deviceData: DeviceFormData): Promise<Device> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/devices`, deviceData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 400 && error.response.data.detail === "MAC address already exists") {
        throw new Error("MAC address already exists");
      }
    }
    throw error;
  }
};

export const updateDevice = async (id: number, deviceData: Partial<DeviceFormData>): Promise<Device> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/devices/${id}`, deviceData);
    return response.data;
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

export const deleteDevice = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${id}`);
};

// classification
export const getClassifications = async (): Promise<Classification[]> => {
  const response = await axios.get(`${API_BASE_URL}/classifications`);
  return response.data;
};

export const getClassification = async (id: number): Promise<Classification> => {
  const response = await axios.get(`${API_BASE_URL}/classifications/${id}`);
  return response.data;
};

export const createClassification = async (classificationData: Partial<Classification>): Promise<Classification> => {
  const response = await axios.post(`${API_BASE_URL}/classifications`, classificationData);
  return response.data;
};

export const updateClassification = async (id: number, classificationData: ClassificationUpdate): Promise<Classification> => {
  const response = await axios.put(`${API_BASE_URL}/classifications/${id}`, classificationData);
  return response.data;
};

export const deleteClassification = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/classifications/${id}`);
};

export const getClassificationGroups = async (): Promise<ClassificationGroup[]> => {
  const response = await axios.get(`${API_BASE_URL}/classifications/classification-groups`);
  return response.data;
};

// PLC関連のAPI呼び出し
export const getPLCs = async (): Promise<PLCWithAddressRanges[]> => {
  const response = await axios.get(`${API_BASE_URL}/plcs`);
  return response.data;
};

export const getPLC = async (id: number): Promise<PLCWithAddressRanges> => {
  const response = await axios.get(`${API_BASE_URL}/plcs/${id}`);
  return response.data;
};

export const createPLC = async (plcData: PLCFormDataWithAddressRanges): Promise<PLCWithAddressRanges> => {
  const response = await axios.post(`${API_BASE_URL}/plcs`, plcData);
  return response.data;
};

export const updatePLC = async (id: number, plcData: Partial<PLCFormDataWithAddressRanges>): Promise<PLCWithAddressRanges> => {
  const response = await axios.put(`${API_BASE_URL}/plcs/${id}`, plcData);
  return response.data;
};

export const deletePLC = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/plcs/${id}`);
};

// TimeTable関連のAPI呼び出し
export const getTimeTables = async (): Promise<TimeTable[]> => {
  const response = await axios.get(`${API_BASE_URL}/time_tables`);
  return response.data;
};

export const createTimeTable = async (timeTableData: TimeTableRequest): Promise<TimeTable[]> => {
  const response = await axios.post(`${API_BASE_URL}/time_tables`, timeTableData);
  return response.data;
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await axios.get(`${API_BASE_URL}/customers`);
  return response.data;
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const response = await axios.get(`${API_BASE_URL}/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: CustomerFormData): Promise<Customer> => {
  const response = await axios.post(`${API_BASE_URL}/customers`, customerData);
  return response.data;
};

export const updateCustomer = async (id: number, customerData: CustomerFormData): Promise<Customer> => {
  const response = await axios.put(`${API_BASE_URL}/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/customers/${id}`);
};

// Products
export const getProducts = async (): Promise<ProductWithCustomer[]> => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await axios.get(`${API_BASE_URL}/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  const response = await axios.post(`${API_BASE_URL}/products`, productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: ProductFormData): Promise<Product> => {
  const response = await axios.put(`${API_BASE_URL}/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/products/${id}`);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await axios.get(`${API_BASE_URL}/users/${id}`);
  return response.data;
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  return response.data;
};

export const updateUser = async (id: string, userData: UserFormData): Promise<User> => {
  const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {  // number から string に変更
  await axios.delete(`${API_BASE_URL}/users/${id}`);
};

// clients
export const getClientsForDevice = async (deviceId: number): Promise<Client[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/clients`);
  return response.data;
};

export const createClient = async (deviceId: number, clientData: ClientFormData): Promise<Client> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/clients`, clientData);
  return response.data;
};

export const getClient = async (deviceId: number, clientId: number): Promise<Client> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/clients/${clientId}`);
  return response.data;
};

export const updateClient = async (deviceId: number, clientId: number, clientData: ClientFormData): Promise<Client> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/clients/${clientId}`, clientData);
  return response.data;
};

export const deleteClient = async (deviceId: number, clientId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/clients/${clientId}`);
};

// efficiency
export const getEfficiencyAddresses = async (deviceId: number): Promise<EfficiencyAddress[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/efficiency-addresses`);
  return response.data;
};

export const createEfficiencyAddress = async (deviceId: number, efficiencyAddressData: EfficiencyAddressFormData): Promise<EfficiencyAddress> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/efficiency-addresses`, efficiencyAddressData);
  return response.data;
};

export const updateEfficiencyAddress = async (deviceId: number, efficiencyAddressId: number, efficiencyAddressData: EfficiencyAddressFormData): Promise<EfficiencyAddress> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/efficiency-addresses/${efficiencyAddressId}`, efficiencyAddressData);
  return response.data;
};

export const deleteEfficiencyAddress = async (deviceId: number, efficiencyAddressId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/efficiency-addresses/${efficiencyAddressId}`);
};

// Alarm Groups
export const getAlarmGroups = async (deviceId: number): Promise<AlarmGroup[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/alarm-groups`);
  return response.data;
};

export const createAlarmGroup = async (deviceId: number, alarmGroupData: AlarmGroupFormData): Promise<AlarmGroup> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/alarm-groups`, alarmGroupData);
  return response.data;
};

export const updateAlarmGroup = async (deviceId: number, groupId: number, alarmGroupData: AlarmGroupFormData): Promise<AlarmGroup> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}`, alarmGroupData);
  return response.data;
};

export const deleteAlarmGroup = async (deviceId: number, groupId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}`);
};

// Alarm Addresses
export const getAlarmAddresses = async (deviceId: number, groupId: number): Promise<AlarmAddress[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}/addresses`);
  return response.data;
};

export const createAlarmAddresses = async (deviceId: number, groupId: number, alarmAddressData: AlarmAddressFormData): Promise<AlarmAddress> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}/addresses`, alarmAddressData);
  return response.data;
};

export const createBulkAlarmAddresses = async (deviceId: number, groupId: number, alarmAddressDataList: AlarmAddressFormData[]): Promise<AlarmAddress[]> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}/addresses/bulk`, alarmAddressDataList);
  return response.data;
};

export const updateAlarmAddresses = async (deviceId: number, groupId: number, alarmAddressDataList: AlarmAddressFormData[]): Promise<AlarmAddress[]> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}/addresses/bulk`, alarmAddressDataList);
  return response.data;
};

export const deleteAlarmAddresses = async (deviceId: number, groupId: number, addressId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/alarm-groups/${groupId}/addresses/${addressId}`);
};

// Logging Settings
export const getLoggingSettings = async (deviceId: number): Promise<LoggingSetting[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/logging-settings`);
  return response.data;
};

export const createLoggingSetting = async (deviceId: number, loggingSettingData: LoggingSettingFormData): Promise<LoggingSetting> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/logging-settings`, loggingSettingData);
  return response.data;
};

export const updateLoggingSetting = async (deviceId: number, loggingSettingId: number, loggingSettingData: Partial<LoggingSettingFormData>): Promise<LoggingSetting> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/logging-settings/${loggingSettingId}`, loggingSettingData);
  return response.data;
};

export const deleteLoggingSetting = async (deviceId: number, loggingSettingId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/logging-settings/${loggingSettingId}`);
};

// Logging Data Settings
export const createLoggingDataSetting = async (deviceId: number, loggingSettingId: number, loggingDataSettingData: LoggingDataSettingFormData): Promise<LoggingDataSetting> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/logging-settings/${loggingSettingId}/data`, loggingDataSettingData);
  return response.data;
};

export const updateLoggingDataSetting = async (deviceId: number, loggingSettingId: number, loggingDataSettingId: number, loggingDataSettingData: Partial<LoggingDataSettingFormData>): Promise<LoggingDataSetting> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/logging-settings/${loggingSettingId}/data/${loggingDataSettingId}`, loggingDataSettingData);
  return response.data;
};

export const deleteLoggingDataSetting = async (deviceId: number, loggingSettingId: number, loggingDataSettingId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/logging-settings/${loggingSettingId}/data/${loggingDataSettingId}`);
};

// Quality Control Signals
export const getQualityControlSignals = async (deviceId: number): Promise<QualityControlSignal[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/quality-control-signals`);
  return response.data;
};

export const createQualityControlSignal = async (deviceId: number, QualityControlSignalData: QualityControlSignalCreateData): Promise<QualityControlSignal> => {
  const response = await axios.post(`${API_BASE_URL}/devices/${deviceId}/quality-control-signals`, QualityControlSignalData);
  return response.data;
};

export const updateQualityControlSignal = async (deviceId: number, QualityControlSignalId: number, QualityControlSignalData: QualityControlSignalUpdateData): Promise<QualityControlSignal> => {
  const response = await axios.put(`${API_BASE_URL}/devices/${deviceId}/quality-control-signals/${QualityControlSignalId}`, QualityControlSignalData);
  return response.data;
};

export const deleteQualityControlSignal = async (deviceId: number, QualityControlSignalId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/quality-control-signals/${QualityControlSignalId}`);
};

// Device Product Association
export const getProductsWithCustomers = async (deviceId: number): Promise<DeviceProductAssociation[]> => {
  const response = await axios.get(`${API_BASE_URL}/devices/${deviceId}/products`);
  return response.data;
};

export const addProductToDevice = async (deviceId: number, productId: number): Promise<void> => {
  await axios.post(`${API_BASE_URL}/devices/${deviceId}/products/${productId}`);
};

export const removeProductFromDevice = async (deviceId: number, productId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/devices/${deviceId}/products/${productId}`);
};

export const downloadDeviceData = async (deviceId: number, date: string, encoding: string): Promise<Blob> => {
  const response = await axios.get(
    `${API_BASE_URL}/data/${deviceId}/aggregated_data?date=${date}&encoding=${encoding}`,
    { responseType: 'blob' }
  );
  return response.data;
};