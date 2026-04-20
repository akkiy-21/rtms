import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PLCForm from '../components/PLCForm';
import { getPLC, updatePLC } from '../services/api';
import { PLCFormData } from '../components/features/plcs/plc-form-schema';
import { PLCWithAddressRanges } from '../types/plc';
import { PageHeader } from '../components/layout/page-header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { useToast } from '../hooks/use-toast';
import { PLC_LABELS } from '../localization/constants/plc-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const PLCEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plc, setPlc] = useState<PLCWithAddressRanges | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPLC = async () => {
      if (!id) return;
      
      try {
        setIsFetching(true);
        setError(null);
        const fetchedPLC = await getPLC(parseInt(id, 10));
        setPlc(fetchedPLC);
      } catch (err) {
        setError(MESSAGE_FORMATTER.ERROR_FETCH(PLC_LABELS.PLC));
      } finally {
        setIsFetching(false);
      }
    };

    fetchPLC();
  }, [id]);

  const handleSubmit = async (data: PLCFormData) => {
    if (!id) return;

    try {
      setIsLoading(true);
      await updatePLC(parseInt(id, 10), data);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_UPDATE(PLC_LABELS.PLC),
      });
      navigate('/plcs');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_UPDATE(PLC_LABELS.PLC),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/plcs');
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={PLC_LABELS.EDIT_PLC} description={`${PLC_LABELS.PLC}の情報を編集します`} />
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!plc) {
    return (
      <div className="space-y-6">
        <PageHeader title={PLC_LABELS.EDIT_PLC} description={`${PLC_LABELS.PLC}の情報を編集します`} />
        <ErrorMessage message={MESSAGE_FORMATTER.ERROR_NOT_FOUND(PLC_LABELS.PLC)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={PLC_LABELS.EDIT_PLC} description={`${PLC_LABELS.PLC}の情報を編集します`} />
      <Card>
        <CardContent className="pt-6">
          <PLCForm initialData={plc} onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {ACTION_LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? MESSAGE_FORMATTER.UPDATING() : ACTION_LABELS.UPDATE}
              </Button>
            </div>
          </PLCForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLCEditPage;