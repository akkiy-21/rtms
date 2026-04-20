// src/types/QualityControl.ts
export enum SignalType {
    Good = "Good",
    Ng = "Ng",
    Optional = "Optional"
}

export interface QualityControlSignal {
    id: number;
    device_id: number;
    client_id: number;
    address_type: string;
    address: string;
    signal_type: SignalType;
    signal_shot_number: number;
    signal_name: string;
    parent_id: number | null;
    children: QualityControlSignal[];
}

export interface QualityControlSignalFormData {
    client_id: number;
    address_type: string;
    address: string;
    signal_type: SignalType;
    signal_shot_number: number;
    signal_name: string;
    parent_id: number | null;
}

export type QualityControlSignalCreateData = QualityControlSignalFormData;
export type QualityControlSignalUpdateData = Partial<QualityControlSignalFormData>;

export interface QualityControlSignalUpdateDataWithStringParentId extends Omit<QualityControlSignalUpdateData, 'parent_id'> {
    parent_id?: string | number | null;
}