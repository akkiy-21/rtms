import React from 'react';
import { useNavigate } from 'react-router-dom';
import PLCForm from '../components/PLCForm';
import { createPLC } from '../services/api';
import { PLCFormData } from '../components/features/plcs/plc-form-schema';
import { PageHeader } from '../components/layout/page-header';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { PLC_LABELS } from '../localization/constants/plc-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

const PLCCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: PLCFormData) => {
    try {
      setIsLoading(true);
      await createPLC(data);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_CREATE(PLC_LABELS.PLC),
      });
      navigate('/plcs');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_CREATE(PLC_LABELS.PLC),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/plcs');
  };

  return (
    <div className="space-y-6">
      <PageHeader title={PLC_LABELS.CREATE_NEW_PLC} description={`新しい${PLC_LABELS.PLC}を作成します`} />
      <Card>
        <CardContent className="pt-6">
          <PLCForm onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {ACTION_LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? MESSAGE_FORMATTER.CREATING() : ACTION_LABELS.CREATE}
              </Button>
            </div>
          </PLCForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLCCreatePage;