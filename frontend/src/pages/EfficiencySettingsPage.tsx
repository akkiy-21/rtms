// src/pages/EfficiencySettingsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EfficiencyAddressList from '../components/EfficiencyAddressList';
import EfficiencyAddressForm from '../components/EfficiencyAddressForm';
import { getEfficiencyAddresses, createEfficiencyAddress, updateEfficiencyAddress, deleteEfficiencyAddress, getClientsForDevice, getDevice } from '../services/api';
import { EfficiencyAddress } from '../types/efficiency';
import { EfficiencyAddressFormData } from '../components/features/efficiency/efficiency-address-form-schema';
import { Client } from '../types/client';
import { Classification } from '../types/classification';
import { Device } from '../types/device';
import { getClassifications } from '../services/api';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { NAVIGATION_LABELS } from '../localization/constants/navigation-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';

const EfficiencySettingsPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const { toast } = useToast();
  const [efficiencyAddresses, setEfficiencyAddresses] = useState<EfficiencyAddress[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<EfficiencyAddress | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEfficiencyAddresses();
    fetchClients();
    fetchClassifications();
    fetchDevice();
  }, [deviceId]);

  const fetchDevice = async () => {
    if (deviceId) {
      try {
        const fetchedDevice = await getDevice(parseInt(deviceId));
        setDevice(fetchedDevice);
      } catch (error) {
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.DEVICE_INFO_FETCH_FAILED,
        });
      }
    }
  };

  const fetchEfficiencyAddresses = async () => {
    if (deviceId) {
      try {
        const fetchedAddresses = await getEfficiencyAddresses(parseInt(deviceId));
        setEfficiencyAddresses(fetchedAddresses);
      } catch (error) {
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.EFFICIENCY_ADDRESS_FETCH_FAILED,
        });
      }
    }
  };

  const fetchClients = async () => {
    if (deviceId) {
      try {
        const fetchedClients = await getClientsForDevice(parseInt(deviceId));
        setClients(fetchedClients);
      } catch (error) {
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.CLIENT_FETCH_FAILED,
        });
      }
    }
  };

  const fetchClassifications = async () => {
    try {
      const fetchedClassifications = await getClassifications();
      setClassifications(fetchedClassifications);
    } catch (error) {
      toast({
        variant: "destructive",
        title: SETTINGS_LABELS.ERROR,
        description: SETTINGS_LABELS.CLASSIFICATION_FETCH_FAILED,
      });
    }
  };

  const handleCreate = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const addressToEdit = efficiencyAddresses.find(address => address.id === id);
    if (addressToEdit) {
      setEditingAddress(addressToEdit);
      setIsFormOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    setAddressToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deviceId && addressToDelete) {
      setIsLoading(true);
      try {
        await deleteEfficiencyAddress(parseInt(deviceId), addressToDelete);
        await fetchEfficiencyAddresses();
        toast({
          title: SETTINGS_LABELS.SUCCESS,
          description: SETTINGS_LABELS.EFFICIENCY_ADDRESS_DELETED,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: SETTINGS_LABELS.EFFICIENCY_ADDRESS_DELETE_FAILED,
        });
      } finally {
        setIsLoading(false);
        setDeleteDialogOpen(false);
        setAddressToDelete(null);
      }
    }
  };

  const handleSubmit = async (data: EfficiencyAddressFormData) => {
    if (deviceId) {
      setIsLoading(true);
      try {
        if (editingAddress) {
          await updateEfficiencyAddress(parseInt(deviceId), editingAddress.id, data);
          toast({
            title: SETTINGS_LABELS.SUCCESS,
            description: SETTINGS_LABELS.EFFICIENCY_ADDRESS_UPDATED,
          });
        } else {
          await createEfficiencyAddress(parseInt(deviceId), data);
          toast({
            title: SETTINGS_LABELS.SUCCESS,
            description: SETTINGS_LABELS.EFFICIENCY_ADDRESS_CREATED,
          });
        }
        await fetchEfficiencyAddresses();
        setIsFormOpen(false);
        setEditingAddress(null);
      } catch (error) {
        toast({
          variant: "destructive",
          title: SETTINGS_LABELS.ERROR,
          description: editingAddress ? SETTINGS_LABELS.EFFICIENCY_ADDRESS_UPDATE_FAILED : SETTINGS_LABELS.EFFICIENCY_ADDRESS_CREATE_FAILED,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title={SETTINGS_LABELS.EFFICIENCY_SETTINGS}
        description={SETTINGS_LABELS.MANAGE_EFFICIENCY_ADDRESSES}
        breadcrumbs={[
          { label: NAVIGATION_LABELS.DEVICES, href: '/devices' },
          { label: device?.name || `Device ${deviceId}`, href: `/devices/${deviceId}/edit` },
          { label: NAVIGATION_LABELS.DETAILS_SETTINGS, href: `/devices/${deviceId}/detail-settings` },
          { label: NAVIGATION_LABELS.EFFICIENCY_SETTINGS },
        ]}
        actions={
          <Button onClick={handleCreate}>
            {SETTINGS_LABELS.NEW_EFFICIENCY_ADDRESS}
          </Button>
        }
      />
      
      <Card>
        <CardContent className="pt-6">
          <EfficiencyAddressList 
            efficiencyAddresses={efficiencyAddresses} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            clients={clients}
            classifications={classifications}
          />
        </CardContent>
      </Card>

      <EfficiencyAddressForm 
        key={editingAddress ? editingAddress.id : 'new'}
        initialData={editingAddress || undefined}
        onSubmit={handleSubmit}
        clients={clients}
        classifications={classifications}
        onClose={handleCloseForm}
        open={isFormOpen}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={SETTINGS_LABELS.DELETE_EFFICIENCY_ADDRESS}
        description={SETTINGS_LABELS.EFFICIENCY_ADDRESS_DELETE_CONFIRM}
        confirmLabel={SETTINGS_LABELS.DELETE}
        cancelLabel={SETTINGS_LABELS.CANCEL}
        variant="destructive"
        isLoading={isLoading}
      />
    </div>
  );
};

export default EfficiencySettingsPage;