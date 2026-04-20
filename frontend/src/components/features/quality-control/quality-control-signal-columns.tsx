import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { QualityControlSignal, SignalType } from "@/types/qualityControl";
import { Client } from "@/types/client";
import { SETTINGS_LABELS } from "@/localization/constants/settings-labels";

interface QualityControlSignalColumnsProps {
  deviceId: number;
  clients: Client[];
  onEdit: (signal: QualityControlSignal) => void;
  onDelete: (signalId: number) => void;
  onAddChild: (parentSignal: QualityControlSignal) => void;
}

export const createQualityControlSignalColumns = ({
  clients,
  onEdit,
  onDelete,
  onAddChild,
}: QualityControlSignalColumnsProps): ColumnDef<QualityControlSignal & { level: number }>[] => [
  {
    accessorKey: "signal_name",
    header: SETTINGS_LABELS.SIGNAL_NAME,
    cell: ({ row }) => {
      const signal = row.original;
      const level = signal.level || 0;
      
      return (
        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
          {level > 0 && (
            <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30 mr-2" />
          )}
          <span className="font-medium">{signal.signal_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "signal_type",
    header: SETTINGS_LABELS.SIGNAL_TYPE,
    cell: ({ row }) => {
      const signalType = row.getValue("signal_type") as SignalType;
      const getTypeLabel = (type: SignalType) => {
        switch (type) {
          case SignalType.Good:
            return SETTINGS_LABELS.SIGNAL_TYPE_GOOD;
          case SignalType.Ng:
            return SETTINGS_LABELS.SIGNAL_TYPE_NG;
          case SignalType.Optional:
            return SETTINGS_LABELS.SIGNAL_TYPE_OPTIONAL;
          default:
            return type;
        }
      };

      const getTypeVariant = (type: SignalType) => {
        switch (type) {
          case SignalType.Good:
            return "default";
          case SignalType.Ng:
            return "destructive";
          case SignalType.Optional:
            return "secondary";
          default:
            return "outline";
        }
      };

      return (
        <Badge variant={getTypeVariant(signalType)}>
          {getTypeLabel(signalType)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "client_id",
    header: SETTINGS_LABELS.QC_CLIENT,
    cell: ({ row }) => {
      const clientId = row.getValue("client_id") as number;
      const client = clients.find(c => c.id === clientId);
      return client ? client.name : `Client ${clientId}`;
    },
  },
  {
    accessorKey: "address_type",
    header: SETTINGS_LABELS.QC_ADDRESS_TYPE,
  },
  {
    accessorKey: "address",
    header: SETTINGS_LABELS.QC_ADDRESS,
  },
  {
    accessorKey: "signal_shot_number",
    header: SETTINGS_LABELS.SHOT_NUMBER,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const signal = row.original;
      const isChildSignal = signal.level > 0;

      return (
        <div className="flex items-center gap-2">
          {!isChildSignal ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(signal)}
              title="子シグナルを追加"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            // 子シグナルの場合は見えないButtonでスペースを確保
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="invisible"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(signal)}
            title="編集"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(signal.id)}
            title="削除"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];