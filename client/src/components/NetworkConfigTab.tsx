// NetworkConfigTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Button,
  Typography,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Error, Warning } from '@mui/icons-material';
import { NetworkAdapter, NetworkSettings } from '../types';

interface NetworkConfigTabProps {
  onApplySettings: () => void;
}

const NetworkConfigTab: React.FC<NetworkConfigTabProps> = ({ onApplySettings }) => {
  const [adapters, setAdapters] = useState<NetworkAdapter[]>([]);
  const [selectedAdapter, setSelectedAdapter] = useState<string>('');
  const [currentAdapter, setCurrentAdapter] = useState<NetworkAdapter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // アダプタの状態に応じたChipの色とアイコンを返す関数
  const getStateChip = (adapter: NetworkAdapter) => {
    const state = adapter.state?.toLowerCase() || '';

    if (adapter.isUp || state === 'connected' || state === 'up') {
      return (
        <Chip
          icon={<CheckCircle />}
          label="接続中"
          color="success"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else if (state === 'disconnected' || state === 'down') {
      return (
        <Chip
          icon={<Error />}
          label="切断"
          color="error"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else if (state === 'unavailable' || state === 'disabled') {
      return (
        <Chip
          icon={<Warning />}
          label="無効"
          color="warning"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else {
      return (
        <Chip
          icon={<Warning />}
          label={state || '不明'}
          color="default"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    }
  };

  // Form state
  const [useDHCP, setUseDHCP] = useState<boolean>(true);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [subnetMask, setSubnetMask] = useState<string>('255.255.255.0');
  const [gateway, setGateway] = useState<string>('');
  const [ssid, setSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // アダプタ一覧を取得
  useEffect(() => {
    loadAdapters();
  }, []);

  const loadAdapters = async () => {
    setLoading(true);
    setError(null);
    try {
      const adapterList = await window.electronAPI.getNetworkAdapters();
      setAdapters(adapterList);
      if (adapterList.length > 0) {
        const firstAdapter = adapterList[0];
        setSelectedAdapter(firstAdapter.name);
        setCurrentAdapter(firstAdapter);

        // 現在の設定値を初期値として設定
        setIpAddress(firstAdapter.currentIP || '');
        setSubnetMask(firstAdapter.subnetMask || '255.255.255.0');
        setGateway(firstAdapter.gateway || '');

        // DHCP/固定IPの自動判定
        setUseDHCP(firstAdapter.isDHCP !== undefined ? firstAdapter.isDHCP : true);

        // 無線の場合、SSID設定
        if (firstAdapter.type === 'wireless' && firstAdapter.ssid) {
          setSsid(firstAdapter.ssid);
        }
      }
    } catch (err: any) {
      setError(`アダプタ一覧の取得に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // アダプタ選択時の処理
  const handleAdapterChange = (event: SelectChangeEvent) => {
    const adapterName = event.target.value;
    setSelectedAdapter(adapterName);
    const adapter = adapters.find(a => a.name === adapterName);
    setCurrentAdapter(adapter || null);

    // 現在の設定値を初期値として設定
    if (adapter) {
      setIpAddress(adapter.currentIP || '');
      setSubnetMask(adapter.subnetMask || '255.255.255.0');
      setGateway(adapter.gateway || '');

      // DHCP/固定IPの自動判定
      setUseDHCP(adapter.isDHCP !== undefined ? adapter.isDHCP : true);
    } else {
      setIpAddress('');
      setSubnetMask('255.255.255.0');
      setGateway('');
      setUseDHCP(true);
    }

    // 無線/有線によって初期化
    if (adapter?.type === 'wireless') {
      setSsid(adapter.ssid || '');
      setWifiPassword(''); // パスワードは常に空欄
    }
  };

  // 設定適用
  const handleApply = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!currentAdapter) {
      setError('アダプタが選択されていません');
      setLoading(false);
      return;
    }

    // バリデーション
    if (!useDHCP) {
      if (!ipAddress) {
        setError('IPアドレスを入力してください');
        setLoading(false);
        return;
      }
      if (!subnetMask) {
        setError('サブネットマスクを入力してください');
        setLoading(false);
        return;
      }
    }

    if (currentAdapter.type === 'wireless' && !ssid) {
      setError('SSIDを入力してください');
      setLoading(false);
      return;
    }

    const settings: NetworkSettings = {
      adapterName: selectedAdapter,
      useDHCP,
      ipAddress: useDHCP ? undefined : ipAddress,
      subnetMask: useDHCP ? undefined : subnetMask,
      gateway: useDHCP ? undefined : gateway,
      ssid: currentAdapter.type === 'wireless' ? ssid : undefined,
      wifiPassword: currentAdapter.type === 'wireless' ? wifiPassword : undefined,
    };

    // 型情報をsettingsに追加（main.ts側で判定に使用）
    (settings as any).type = currentAdapter.type;

    try {
      const result = await window.electronAPI.applyNetworkSettings(settings);
      if (result.success) {
        setSuccess(result.message);
        // 設定適用後、アプリを再初期化
        setTimeout(() => {
          onApplySettings();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(`設定の適用に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && adapters.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        ネットワーク設定
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="adapter-select-label">ネットワークアダプタ</InputLabel>
        <Select
          labelId="adapter-select-label"
          value={selectedAdapter}
          label="ネットワークアダプタ"
          onChange={handleAdapterChange}
        >
          {adapters.map((adapter) => (
            <MenuItem key={adapter.name} value={adapter.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  {adapter.name} ({adapter.type === 'wireless' ? '無線' : '有線'}) - {adapter.mac}
                  {adapter.currentIP && ` - ${adapter.currentIP}`}
                </Box>
                {getStateChip(adapter)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentAdapter && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            アダプタ情報
          </Typography>
          <Typography variant="body2" color="text.secondary">
            種別: {currentAdapter.type === 'wireless' ? '無線' : '有線'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MACアドレス: {currentAdapter.mac}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              接続状態:
            </Typography>
            <Box sx={{ ml: 1 }}>{getStateChip(currentAdapter)}</Box>
          </Box>
          {currentAdapter.type === 'wireless' && currentAdapter.ssid && (
            <Typography variant="body2" color="text.secondary">
              接続中のSSID: {currentAdapter.ssid}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            IP設定モード: {currentAdapter.isDHCP ? 'DHCP (自動取得)' : '手動設定'}
          </Typography>
          {currentAdapter.currentIP && (
            <Typography variant="body2" color="text.secondary">
              IPアドレス: {currentAdapter.currentIP}
            </Typography>
          )}
          {currentAdapter.subnetMask && (
            <Typography variant="body2" color="text.secondary">
              サブネットマスク: {currentAdapter.subnetMask}
            </Typography>
          )}
          {currentAdapter.gateway && (
            <Typography variant="body2" color="text.secondary">
              ゲートウェイ: {currentAdapter.gateway}
            </Typography>
          )}

          {/* 切断中のアダプタに対する警告 */}
          {!currentAdapter.isUp && (
            <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
              このアダプタは現在切断されています。設定を変更して接続を試みることができます。
            </Alert>
          )}

          {/* WiFi設定（無線の場合のみ） */}
          {currentAdapter.type === 'wireless' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                WiFi設定
              </Typography>
              <TextField
                fullWidth
                label="SSID"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                sx={{ mb: 2 }}
                helperText="接続するWiFiネットワークのSSIDを入力してください"
              />
              <TextField
                fullWidth
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                sx={{ mb: 2 }}
                helperText="変更する場合のみ新しいパスワードを入力してください（空欄の場合は既存のパスワードを維持）"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {/* IP設定 */}
          <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">IP設定モード</FormLabel>
              <RadioGroup
                row
                value={useDHCP ? 'dhcp' : 'manual'}
                onChange={(e) => setUseDHCP(e.target.value === 'dhcp')}
              >
                <FormControlLabel value="dhcp" control={<Radio />} label="DHCP (自動取得)" />
                <FormControlLabel value="manual" control={<Radio />} label="手動設定" />
              </RadioGroup>
            </FormControl>

            {!useDHCP && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="IPアドレス"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="例: 192.168.1.100"
                />
                <TextField
                  fullWidth
                  label="サブネットマスク"
                  value={subnetMask}
                  onChange={(e) => setSubnetMask(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="例: 255.255.255.0"
                />
                <TextField
                  fullWidth
                  label="デフォルトゲートウェイ"
                  value={gateway}
                  onChange={(e) => setGateway(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="例: 192.168.1.1"
                />
              </Box>
            )}
          </Box>

          <Alert severity="warning" sx={{ mt: 3, mb: 2 }}>
            設定を適用すると、ネットワーク接続が一時的に切断される場合があります。
            設定適用後、アプリケーションが自動的に再初期化されます。
          </Alert>

          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : '設定を適用'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NetworkConfigTab;
