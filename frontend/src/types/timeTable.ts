// timeTable.ts

export interface TimeTable {
    id: number;
    start_time: string;
    end_time: string;
}
  
export interface TimeTableRequest {
    base_time: string;
}