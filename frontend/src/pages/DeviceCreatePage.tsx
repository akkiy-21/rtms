// DeviceCreatePage.tsx
// デバイス作成ページ - ペアリングコード経由で新規端末を登録

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceForm from '../components/DeviceForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { createDraftDeviceFromPairing, getTimeTables, updateDevice } from '../services/api';
import { DeviceFormData } from '../components/features/devices/device-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { DEVICE_LABELS } from '../localization/constants/device-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Device } from '../types/device';

const DeviceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [isLoading, setIsLoading] = useState(false);
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [isLookingUpPairing, setIsLookingUpPairing] = useState(false);
  const [draftDevice, setDraftDevice] = useState<Device | null>(null);
  const [hasTimeTables, setHasTimeTables] = useState(true);
  const [isCheckingTimeTables, setIsCheckingTimeTables] = useState(true);

  const normalizedPairingCode = useMemo(() => pairingCodeInput.replace(/\D/g, '').slice(0, 4), [pairingCodeInput]);

  useEffect(() => {
    const loadTimeTables = async () => {
      try {
        setIsCheckingTimeTables(true);
        const timeTables = await getTimeTables();
        setHasTimeTables(timeTables.length > 0);
      } catch (error) {
        setHasTimeTables(false);
        handleError(error, 'タイムテーブル確認エラー');
      } finally {
        setIsCheckingTimeTables(false);
      }
    };

    void loadTimeTables();
  }, [handleError]);

  const handleLookupPairing = async () => {
    if (!hasTimeTables) {
      handleError('先にタイムテーブルを1件以上設定してください', 'デバイスを登録できません');
      return;
    }

    try {
      setIsLookingUpPairing(true);
      const result = await createDraftDeviceFromPairing(normalizedPairingCode);
      setDraftDevice(result);
    } catch (error) {
      setDraftDevice(null);
      handleError(error, 'ペアリングコード確認エラー');
    } finally {
      setIsLookingUpPairing(false);
    }
  };

  const handleSubmit = async (data: DeviceFormData) => {
    if (!hasTimeTables) {
      handleError('先にタイムテーブルを1件以上設定してください', 'デバイスを登録できません');
      return;
    }

    if (!draftDevice) {
      handleError('有効なペアリングコードを確認してください', '登録できません');
      return;
    }

    try {
      setIsLoading(true);
      await updateDevice(draftDevice.id, {
        mac_address: draftDevice.mac_address,
        name: data.name,
        device_status: 'active',
        ssh_username: data.ssh_username,
        ssh_password: data.ssh_password,
        standard_cycle_time: data.standard_cycle_time,
      });
      navigate('/devices');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/devices');
  };

  return (
    <FormWrapper
      title={`新規${DEVICE_LABELS.DEVICE}作成`}
      description={`client に表示された4桁コードから新しい${DEVICE_LABELS.DEVICE}を登録します`}
    >
      <div className="space-y-6">
        {!hasTimeTables && !isCheckingTimeTables && (
          <Alert variant="destructive">
            <AlertTitle>タイムテーブルが未設定です</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>デバイスを本登録する前に、タイムテーブルを1件以上作成してください。</p>
              <Button type="button" variant="outline" onClick={() => navigate('/time-table')}>
                タイムテーブル設定へ移動
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">ペアリングコード</h3>
            <p className="text-sm text-muted-foreground">未登録 client に表示された 4 桁コードを入力してください。</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={pairingCodeInput}
              onChange={(event) => {
                setPairingCodeInput(event.target.value);
                setDraftDevice(null);
              }}
              placeholder="1234"
              inputMode="numeric"
              maxLength={4}
              disabled={!hasTimeTables || isCheckingTimeTables}
            />
            <Button type="button" variant="secondary" disabled={!hasTimeTables || isCheckingTimeTables || normalizedPairingCode.length !== 4 || isLookingUpPairing} onClick={handleLookupPairing}>
              {isLookingUpPairing ? '仮登録中...' : 'ペアリングして仮登録'}
            </Button>
          </div>
          {draftDevice && (
            <Alert>
              <AlertTitle>端末を仮登録しました</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>MAC: {draftDevice.mac_address}</p>
                <p>このまま入力を続けて本登録できます。途中で離れてもデバイス一覧から再開できます。</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {draftDevice && (
          <DeviceForm
            key={draftDevice.id}
            initialData={{
              mac_address: draftDevice.mac_address,
              name: draftDevice.device_status === 'draft' ? '' : draftDevice.name ?? '',
              ssh_username: draftDevice.ssh_username ?? '',
              ssh_password: draftDevice.ssh_password ?? '',
              standard_cycle_time: draftDevice.standard_cycle_time ?? undefined,
            }}
            onSubmit={handleSubmit}
            showMacAddress={false}
          >
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {ACTION_LABELS.CANCEL}
              </Button>
              <Button type="submit" disabled={!hasTimeTables || isCheckingTimeTables || isLoading}>
                {isLoading ? '登録中...' : '本登録する'}
              </Button>
            </div>
          </DeviceForm>
        )}
      </div>
    </FormWrapper>
  );
};

export default DeviceCreatePage;