import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import DevicesPage from './pages/DevicesPage';
import DeviceCreatePage from './pages/DeviceCreatePage';
import DeviceEditPage from './pages/DeviceEditPage';
import DeviceDetailSettingsPage from './pages/DeviceDetailSettingsPage';
import AlarmGroupsPage from './pages/AlarmGroupsPage';
import LoggingSettingsPage from './pages/LoggingSettingsPage';
import EfficiencySettingsPage from './pages/EfficiencySettingsPage';
import IOSettingsPage from './pages/IOSettingsPage';
import ClassificationsPage from './pages/ClassificationsPage';
import ClassificationEditPage from './pages/ClassificationEditPage';
import ClassificationCreatePage from './pages/ClassificationCreatePage';
import PLCsPage from './pages/PLCsPage';
import PLCCreatePage from './pages/PLCCreatePage';
import PLCEditPage from './pages/PLCEditPage';
import TimeTablePage from './pages/TimeTablePage';
import CustomersPage from './pages/CustomersPage';
import CustomerCreatePage from './pages/CustomerCreatePage';
import CustomerEditPage from './pages/CustomerEditPage';
import ProductsPage from './pages/ProductsPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import UsersPage from './pages/UsersPage';
import UserCreatePage from './pages/UserCreatePage';
import UserEditPage from './pages/UserEditPage';
import GroupsPage from './pages/GroupsPage';
import GroupCreatePage from './pages/GroupCreatePage';
import GroupEditPage from './pages/GroupEditPage';
import GroupUsersPage from './pages/GroupUsersPage';
import ClientSettingsPage from './pages/ClientSettingsPage';
import ClientCreatePage from './pages/ClientCreatePage';
import ClientEditPage from './pages/ClientEditPage';
import AlarmGroupCreatePage from './pages/AlarmGroupCreatePage';
import AlarmGroupEditPage from './pages/AlarmGroupEditPage';
import AlarmAddressesPage from './pages/AlarmAddressesPage';
import LoggingSettingCreatePage from './pages/LoggingSettingCreatePage';
import LoggingSettingEditPage from './pages/LoggingSettingEditPage';
import LoggingDataSettingsPage from './pages/LoggingDataSettingsPage';
import LoggingDataSettingCreatePage from './pages/LoggingDataSettingCreatePage';
import LoggingDataSettingEditPage from './pages/LoggingDataSettingEditPage';
import QualityControlSignalsPage from './pages/QualityControlSignalsPage';
import DeviceProductSettingsPage from './pages/DeviceProductSettingsPage';
import DataDownloadPage from './pages/DataDownloadPage';

const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppLayout>
        <Routes>
          <Route path="/" element={<DevicesPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/devices/create" element={<DeviceCreatePage />} />
          <Route path="/devices/:deviceId/edit" element={<DeviceEditPage />} />
          {/* デバイス詳細設定とその下位ページ */}
          <Route path="/devices/:deviceId/detail-settings" element={<DeviceDetailSettingsPage />} />
          <Route path="/devices/:deviceId/detail-settings/efficiency-settings" element={<EfficiencySettingsPage />} />
          <Route path="/devices/:deviceId/detail-settings/io-settings" element={<IOSettingsPage />} />
          <Route path="/devices/:deviceId/detail-settings/quality-control-signals" element={<QualityControlSignalsPage />} />
          
          {/* クライアント設定関連のルート */}
          <Route path="/devices/:deviceId/detail-settings/client-settings" element={<ClientSettingsPage />} />
          <Route path="/devices/:deviceId/detail-settings/client-settings/create" element={<ClientCreatePage />} />
          <Route path="/devices/:deviceId/detail-settings/client-settings/:clientId/edit" element={<ClientEditPage />} />
          
          {/* アラーム設定関連のルート */}
          <Route path="/devices/:deviceId/detail-settings/alarm-groups" element={<AlarmGroupsPage />} />
          <Route path="/devices/:deviceId/detail-settings/alarm-groups/create" element={<AlarmGroupCreatePage />} />
          <Route path="/devices/:deviceId/detail-settings/alarm-groups/:groupId/edit" element={<AlarmGroupEditPage />} />
          <Route path="/devices/:deviceId/detail-settings/alarm-groups/:groupId/addresses" element={<AlarmAddressesPage />} />
          
          {/* ロギング設定関連のルート */}
          <Route path="/devices/:deviceId/detail-settings/logging-settings" element={<LoggingSettingsPage />} />
          <Route path="/devices/:deviceId/detail-settings/logging-settings/create" element={<LoggingSettingCreatePage />} />
          <Route path="/devices/:deviceId/detail-settings/logging-settings/:settingId/edit" element={<LoggingSettingEditPage />} />
          <Route path="/devices/:deviceId/detail-settings/logging-settings/:loggingSettingId/data" element={<LoggingDataSettingsPage />} />
          <Route path="/devices/:deviceId/detail-settings/logging-settings/:loggingSettingId/create" element={<LoggingDataSettingCreatePage />} />
          <Route path="/devices/:deviceId/detail-settings/logging-settings/:loggingSettingId/edit/:dataSettingId" element={<LoggingDataSettingEditPage />} />
          
          {/* デバイス製品設定関連のルート */}
          <Route path="/devices/:deviceId/detail-settings/product-settings" element={<DeviceProductSettingsPage />} />
          {/* 共通設定関連のルート */}
          <Route path="/classifications" element={<ClassificationsPage />} />
          <Route path="/classifications/:id/edit" element={<ClassificationEditPage />} />
          <Route path="/classifications/create" element={<ClassificationCreatePage />} />
          <Route path="/plcs" element={<PLCsPage />} />
          <Route path="/plcs/create" element={<PLCCreatePage />} />
          <Route path="/plcs/:id/edit" element={<PLCEditPage />} />
          <Route path="/time-table" element={<TimeTablePage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/create" element={<CustomerCreatePage />} />
          <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<ProductCreatePage />} />
          <Route path="/products/:id/edit" element={<ProductEditPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/create" element={<UserCreatePage />} />
          <Route path="/users/:id/edit" element={<UserEditPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/create" element={<GroupCreatePage />} />
          <Route path="/groups/:id/edit" element={<GroupEditPage />} />
          <Route path="/groups/:groupId/users" element={<GroupUsersPage />} />
          {/* Data関連のルート */}
          <Route path="/data-download" element={<DataDownloadPage />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </Router>
  );
};

export default App;
