// DeviceEditPage.tsx
// デバイス編集ページ - FormWrapperとshadcn/uiを使用

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeviceForm from '../components/DeviceForm';
import { FormWrapper } from '../components/common/form-wrapper';
import { LoadingSpinner } from '../components/common/loading-spinner';
import { ErrorMessage } from '../components/common/error-message';
import { confirmPairingByCode, getDevice, reassignDeviceByPairing, releasePairingByCode, releasePairingByCodeKeepalive, updateDevice } from '../services/api';
import { Device, PairingInfo } from '../types/device';
import { DeviceFormData } from '../components/features/devices/device-form-schema';
import { useApiError } from '../hooks/use-api-error';
import { Button } from '../components/ui/button';
import { DEVICE_LABELS } from '../localization/constants/device-labels';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { DATE_FORMATTER } from '../localization/utils/date-formatter';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

const DeviceEditPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [pairingInfo, setPairingInfo] = useState<PairingInfo | null>(null);
  const [isLookingUpPairing, setIsLookingUpPairing] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const shouldReleaseConfirmedPairingRef = useRef(false);

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  useEffect(() => {
    shouldReleaseConfirmedPairingRef.current = Boolean(pairingInfo);
  }, [pairingInfo]);

  useEffect(() => {
    if (!pairingInfo) {
      return undefined;
    }

    const pairingCode = pairingInfo.pairing_code;
    const handlePageHide = () => {
      if (shouldReleaseConfirmedPairingRef.current) {
        releasePairingByCodeKeepalive(pairingCode);
      }
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      if (shouldReleaseConfirmedPairingRef.current) {
        void releasePairingByCode(pairingCode);
      }
    };
  }, [pairingInfo]);

  const fetchDevice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (deviceId) {
        const fetchedDevice = await getDevice(parseInt(deviceId));
        setDevice(fetchedDevice);
      }
    } catch (err) {
      setError(DEVICE_LABELS.ERRORS.FETCH_FAILED);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: DeviceFormData) => {
    try {
      setIsSubmitting(true);
      if (deviceId) {
        await updateDevice(parseInt(deviceId), {
          ...data,
          device_status: device?.device_status === 'draft' ? 'active' : undefined,
        });
        navigate('/devices');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/devices');
  };

  const handleDetailSettings = () => {
    navigate(`/devices/${deviceId}/detail-settings`);
  };

  const handleLookupPairing = async () => {
    try {
      setIsLookingUpPairing(true);
      const result = await confirmPairingByCode(pairingCodeInput.replace(/\D/g, '').slice(0, 4));
      setPairingInfo(result);
    } catch (err) {
      setPairingInfo(null);
      handleError(err, 'ペアリングコード確認エラー');
    } finally {
      setIsLookingUpPairing(false);
    }
  };

  const handleReassign = async () => {
    if (!deviceId || !pairingInfo) {
      handleError('有効なペアリングコードを確認してください', '切り替えできません');
      return;
    }

    try {
      setIsReassigning(true);
      shouldReleaseConfirmedPairingRef.current = false;
      await reassignDeviceByPairing(parseInt(deviceId), { pairing_code: pairingInfo.pairing_code });
      setPairingCodeInput('');
      setPairingInfo(null);
      await fetchDevice();
    } catch (err) {
      shouldReleaseConfirmedPairingRef.current = true;
      handleError(err, '端末切り替えエラー');
    } finally {
      setIsReassigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !device) {
    return (
      <ErrorMessage
        message={error || DEVICE_LABELS.ERRORS.DEVICE_NOT_FOUND}
        retry={fetchDevice}
      />
    );
  }

  const initialFormData: Partial<DeviceFormData> = {
    mac_address: device.mac_address,
    name: device.name,
    ssh_username: device.ssh_username || '',
    ssh_password: device.ssh_password || '',
    standard_cycle_time: device.standard_cycle_time || undefined,
  };

  return (
    <FormWrapper
      title={DEVICE_LABELS.PAGES.EDIT}
      description={`${DEVICE_LABELS.DEVICE}情報を編集します`}
    >
      <div className="space-y-6">
        {device.device_status === 'draft' && (
          <Alert>
            <AlertTitle>このデバイスは仮登録です</AlertTitle>
            <AlertDescription>
              必須情報を入力して保存すると本登録になります。client は本登録完了後に通常起動します。
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">別端末へ設定を切り替え</h3>
            <p className="text-sm text-muted-foreground">未登録 client の 4 桁コードを入力すると、この device の設定を新しい端末へ引き継げます。</p>
          </div>
          <div className="flex gap-2">
            <Input
              value={pairingCodeInput}
              onChange={(event) => {
                setPairingCodeInput(event.target.value);
                setPairingInfo(null);
              }}
              placeholder="1234"
              inputMode="numeric"
              maxLength={4}
            />
            <Button type="button" variant="secondary" disabled={pairingCodeInput.replace(/\D/g, '').length !== 4 || isLookingUpPairing} onClick={handleLookupPairing}>
              {isLookingUpPairing ? '確認中...' : 'コード確認'}
            </Button>
            <Button type="button" disabled={!pairingInfo || isReassigning} onClick={handleReassign}>
              {isReassigning ? '切り替え中...' : 'この端末へ切り替え'}
            </Button>
          </div>
          {pairingInfo && (
            <Alert>
              <AlertTitle>切り替え候補を確認し、client 側のコード更新を停止しました</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>新しい MAC: {pairingInfo.mac_address}</p>
                <p>確認保持期限: {DATE_FORMATTER.formatISOStringToJST(pairingInfo.expires_at)}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DeviceForm initialData={initialFormData} onSubmit={handleSubmit} macAddressReadOnly>
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {ACTION_LABELS.CANCEL}
          </Button>
          {device.device_status === 'active' && (
            <Button type="button" variant="secondary" onClick={handleDetailSettings}>
              {DEVICE_LABELS.ACTIONS.DETAIL_SETTINGS}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '更新中...' : device.device_status === 'draft' ? '本登録する' : ACTION_LABELS.UPDATE}
          </Button>
        </div>
        </DeviceForm>
      </div>
    </FormWrapper>
  );
};

export default DeviceEditPage;
