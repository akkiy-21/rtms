// AlarmAddressList.tsx
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { AlarmAddress, AlarmComment } from '../types/alarm';
import { DataTable } from './common/data-table';
import { DataTableColumnHeader } from './common/data-table-column-header';
import { Badge } from './ui/badge';
import { ALARM_LABELS } from '../localization/constants/alarm-labels';

interface AlarmAddressListProps {
  addresses: AlarmAddress[];
}

// アラームアドレスの表示用の型
type AlarmAddressDisplay = {
  id: number;
  alarm_no: number;
  address_type: string;
  address: string;
  address_bit: number;
  comments: AlarmComment[];
};

const AlarmAddressList: React.FC<AlarmAddressListProps> = ({ addresses }) => {
  // コメントを取得するヘルパー関数
  const getCommentByIndex = (comments: AlarmComment[], index: number) => {
    return comments[index]?.comment || '';
  };

  // カラム定義
  const columns: ColumnDef<AlarmAddressDisplay>[] = [
    {
      accessorKey: 'alarm_no',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={ALARM_LABELS.TABLE.HEADERS.ALARM_NO} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('alarm_no')}</div>
      ),
    },
    {
      accessorKey: 'address_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={ALARM_LABELS.TABLE.HEADERS.TYPE} />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('address_type')}</Badge>
      ),
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={ALARM_LABELS.TABLE.HEADERS.ADDRESS} />
      ),
    },
    {
      accessorKey: 'address_bit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={ALARM_LABELS.TABLE.HEADERS.BIT} />
      ),
    },
    {
      id: 'comment1',
      header: ALARM_LABELS.TABLE.HEADERS.COMMENT_1,
      cell: ({ row }) => {
        const comments = row.original.comments;
        return (
          <div className="max-w-[200px] truncate">
            {getCommentByIndex(comments, 0)}
          </div>
        );
      },
    },
    {
      id: 'comment2',
      header: ALARM_LABELS.TABLE.HEADERS.COMMENT_2,
      cell: ({ row }) => {
        const comments = row.original.comments;
        return (
          <div className="max-w-[200px] truncate">
            {getCommentByIndex(comments, 1)}
          </div>
        );
      },
    },
    {
      id: 'comment3',
      header: ALARM_LABELS.TABLE.HEADERS.COMMENT_3,
      cell: ({ row }) => {
        const comments = row.original.comments;
        return (
          <div className="max-w-[200px] truncate">
            {getCommentByIndex(comments, 2)}
          </div>
        );
      },
    },
  ];

  // データを表示用の形式に変換
  const data: AlarmAddressDisplay[] = addresses.map((address, index) => ({
    id: index,
    alarm_no: parseInt(address.alarm_no.toString(), 10),
    address_type: address.address_type,
    address: address.address,
    address_bit: address.address_bit,
    comments: address.comments || [],
  }));

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        searchKey="alarm_no"
        searchPlaceholder={ALARM_LABELS.PLACEHOLDERS.SEARCH_BY_NUMBER}
      />
    </div>
  );
};

export default AlarmAddressList;
