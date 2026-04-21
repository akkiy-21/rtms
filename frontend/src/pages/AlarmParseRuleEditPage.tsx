import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlarmParseRuleForm from '@/components/AlarmParseRuleForm';
import { getAlarmParseRule, updateAlarmParseRule } from '@/services/api';
import { AlarmParseRule, AlarmParseRuleFormData } from '@/types/alarm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { ACTION_LABELS } from '@/localization/constants/action-labels';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

const AlarmParseRuleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rule, setRule] = useState<AlarmParseRule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRule = async () => {
      if (!id) {
        return;
      }

      try {
        setIsFetching(true);
        setError(null);
        const fetchedRule = await getAlarmParseRule(parseInt(id, 10));
        setRule(fetchedRule);
      } catch (err) {
        setError('アラームパースルールの取得に失敗しました');
      } finally {
        setIsFetching(false);
      }
    };

    fetchRule();
  }, [id]);

  const handleSubmit = async (data: AlarmParseRuleFormData) => {
    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      await updateAlarmParseRule(parseInt(id, 10), data);
      toast({
        title: '成功',
        description: MESSAGE_FORMATTER.SUCCESS_UPDATE('アラームパースルール'),
      });
      navigate('/alarm-parse-rules');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: MESSAGE_FORMATTER.ERROR_UPDATE('アラームパースルール'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!rule) {
    return <ErrorMessage message="アラームパースルールが見つかりません" />;
  }

  const initialData: AlarmParseRuleFormData = {
    name: rule.name,
    description: rule.description ?? '',
    is_active: rule.is_active,
    skip_header_rows: rule.skip_header_rows,
    offset_mode: rule.offset_mode,
    patterns: rule.patterns.map((pattern) => ({
      pattern_name: pattern.pattern_name,
      sort_order: pattern.sort_order,
      regex_pattern: pattern.regex_pattern,
      address_type_value: pattern.address_type_value ?? '',
      address_type_group: pattern.address_type_group ?? null,
      alarm_no_mode: pattern.alarm_no_mode,
      alarm_no_group: pattern.alarm_no_group ?? null,
      alarm_no_offset: pattern.alarm_no_offset,
      address_group: pattern.address_group ?? null,
      bit_group: pattern.bit_group ?? null,
      combined_address_bit_group: pattern.combined_address_bit_group ?? null,
      combined_address_bit_separator: pattern.combined_address_bit_separator,
      comment_mode: pattern.comment_mode,
      comment_group: pattern.comment_group ?? null,
      comment_columns_start: pattern.comment_columns_start ?? null,
      address_pad_length: pattern.address_pad_length,
    })),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="アラームパースルール編集" description="パースルールを編集します" />
      <Card>
        <CardContent className="pt-6">
          <AlarmParseRuleForm initialData={initialData} onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/alarm-parse-rules')}>
                {ACTION_LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? MESSAGE_FORMATTER.UPDATING() : ACTION_LABELS.UPDATE}
              </Button>
            </div>
          </AlarmParseRuleForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlarmParseRuleEditPage;