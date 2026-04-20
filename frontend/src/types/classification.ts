// src/types/classification.ts

export interface ClassificationGroup {
    id: number;
    name: string;
  }
  
export interface Classification {
    id: number;
    name: string;
    group: ClassificationGroup;
}

export interface ClassificationFormData {
    name: string;
    group_id: number;
}

export interface ClassificationCreate {
    name: string;
    group_id: number;
}

export interface ClassificationUpdate {
    name?: string;
    group_id?: number;
}