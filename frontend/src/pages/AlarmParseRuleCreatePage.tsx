import React from 'react';
import { useNavigate } from 'react-router-dom';
import AlarmParseRuleForm from '@/components/AlarmParseRuleForm';
import { createAlarmParseRule } from '@/services/api';
import { AlarmParseRuleFormData } from '@/types/alarm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const AlarmParseRuleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: AlarmParseRuleFormData) => {
    try {
      setIsLoading(true);
      await createAlarmParseRule(data);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_CREATE('アラームパースルール'),
      });
      navigate('/alarm-parse-rules');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_CREATE('アラームパースルール'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="アラームパースルール作成" description="新しいパースルールを作成します" />
      <Card>
        <CardContent className="pt-6">
          <AlarmParseRuleForm onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/alarm-parse-rules')}>
                {ACTION_LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? MESSAGE_FORMATTER.CREATING() : ACTION_LABELS.CREATE}
              </Button>
            </div>
          </AlarmParseRuleForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlarmParseRuleCreatePage;