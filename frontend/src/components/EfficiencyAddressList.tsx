// src/components/EfficiencyAddressList.tsx

import React from 'react';
import { EfficiencyAddress } from '../types/efficiency';
import { Client } from '../types/client';
import { Classification } from '../types/classification';
import { DataTable } from './common/data-table';
import { createEfficiencyAddressColumns } from './features/efficiency/efficiency-address-columns';

interface EfficiencyAddressListProps {
  efficiencyAddresses: EfficiencyAddress[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  clients: Client[];
  classifications: Classification[];
}

const EfficiencyAddressList: React.FC<EfficiencyAddressListProps> = ({ 
  efficiencyAddresses, 
  onEdit, 
  onDelete, 
  clients, 
  classifications 
}) => {
  const columns = createEfficiencyAddressColumns({
    clients,
    classifications,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={efficiencyAddresses}
      searchKey="address"
      searchPlaceholder="アドレスで検索..."
    />
  );
};

export default EfficiencyAddressList;