// TimeTablePage.tsx

import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/page-header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DataTable } from '../components/common/data-table';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { useToast } from '../hooks/use-toast';
import { useApiError } from '../hooks/use-api-error';
import { createTimeTable, getTimeTables } from '../services/api';
import { TimeTable, TimeTableRequest } from '../types/timeTable';
import { ColumnDef } from '@tanstack/react-table';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { TECHNICAL_TERMS } from '../localization/constants/technical-terms';

const TimeTablePage: React.FC = () => {
  const [timeTables, setTimeTables] = useState<TimeTable[]>([]);
  const [baseTime, setBaseTime] = useState('00:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { handleError } = useApiError();

  // テーブルカラム定義
  const columns: ColumnDef<TimeTable>[] = [
    {
      accessorKey: 'id',
      header: TECHNICAL_TERMS.ID,
    },
    {
      accessorKey: 'start_time',
      header: SETTINGS_LABELS.START_TIME,
    },
    {
      accessorKey: 'end_time',
      header: SETTINGS_LABELS.END_TIME,
    },
  ];

  useEffect(() => {
    fetchTimeTables();
  }, []);

  const fetchTimeTables = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTimeTables = await getTimeTables();
      setTimeTables(fetchedTimeTables);
    } catch (err) {
      const errorMessage = SETTINGS_LABELS.TIME_TABLE_FETCH_FAILED;
      setError(errorMessage);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const data: TimeTableRequest = { base_time: baseTime };
      await createTimeTable(data);
      
      toast({
        title: SETTINGS_LABELS.SUCCESS,
        description: SETTINGS_LABELS.TIME_TABLE_GENERATED,
      });
      
      // データを再取得
      await fetchTimeTables();
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    fetchTimeTables();
  };

  if (error && timeTables.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title={SETTINGS_LABELS.TIME_TABLE_MANAGEMENT} 
          description={SETTINGS_LABELS.GENERATE_AND_MANAGE_TIME_TABLES}
        />
        <ErrorMessage 
          message={error} 
          retry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={SETTINGS_LABELS.TIME_TABLE_MANAGEMENT} 
        description={SETTINGS_LABELS.GENERATE_AND_MANAGE_TIME_TABLES}
      />
      
      {/* Time Table Generation Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseTime">{SETTINGS_LABELS.BASE_TIME}</Label>
              <Input
                id="baseTime"
                type="time"
                value={baseTime}
                onChange={(e) => setBaseTime(e.target.value)}
                step={300} // 5分間隔
                className="max-w-xs"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? SETTINGS_LABELS.GENERATING : SETTINGS_LABELS.GENERATE_TIME_TABLE}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Time Tables List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={timeTables}
              searchKey="id"
              searchPlaceholder={SETTINGS_LABELS.SEARCH_TIME_TABLES}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTablePage;