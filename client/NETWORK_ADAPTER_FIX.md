# ネットワークアダプタ表示の問題修正

## 📋 修正日
2024-11-11

## 🐛 問題の詳細

### 症状
IPアドレスの設定が間違っている場合、ネットワークアダプタがリストに表示されず、修正不可能になる。

### 原因
`getNetworkAdapters()` 関数が**接続中（connected/Up）のアダプタのみ**をフィルタリングしていた。

#### Linux (main.ts:563行目)
```typescript
// 接続されているもののみ
if (state === 'connected') {
  return { name, type, isUp: true };
}
```

#### Windows (main.ts:635行目)
```powershell
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
```

### 影響
- IPアドレス設定ミス → アダプタが `disconnected` / `Down` 状態
- リストから除外 → 設定画面でアダプタが表示されない
- **修正不可能な状態に陥る**

---

## ✅ 修正内容

### 修正方針
**すべてのネットワークアダプタを表示し、接続状態を視覚的に表示する**

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| [src/types/index.ts](src/types/index.ts) | `NetworkAdapter` インターフェースに `state?: string` を追加 |
| [src/main.ts](src/main.ts) | `getNetworkAdapters()` 関数を更新（Linux・Windows） |
| [src/components/NetworkConfigTab.tsx](src/components/NetworkConfigTab.tsx) | 状態表示UI を追加 |

---

## 🔧 実装詳細

### 1. 型定義の更新 (src/types/index.ts:119)

```typescript
export interface NetworkAdapter {
  name: string;           // インターフェース名
  type: 'wireless' | 'wired';
  mac: string;            // MACアドレス
  isUp: boolean;          // インターフェースがアクティブかどうか
  state?: string;         // ★ 追加: 接続状態（connected, disconnected, unavailable等）
  currentIP?: string;     // 現在のIPアドレス
  subnetMask?: string;    // サブネットマスク
  gateway?: string;       // デフォルトゲートウェイ
  prefixLength?: number;  // CIDR表記のプレフィックス長
  isDHCP?: boolean;       // DHCP使用中かどうか
  ssid?: string;          // 無線の場合、接続中のSSID
}
```

### 2. Linux用の修正 (src/main.ts:554-579)

**変更前**:
```typescript
// 接続されているもののみ
if (state === 'connected') {
  return { name, type, isUp: true };
}
```

**変更後**:
```typescript
// loopbackは除外
if (name === 'lo') {
  return null;
}

// タイプを判定
const type = deviceType === 'wifi' ? 'wireless' : 'wired';

// すべてのアダプタを含める（接続状態に関わらず）
return {
  name,
  type,
  isUp: state === 'connected',
  state: state  // 状態を保持（connected, disconnected, unavailable等）
};
```

### 3. Windows用の修正 (src/main.ts:643-674)

**変更前**:
```powershell
Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
```

**変更後**:
```powershell
Get-NetAdapter | Select-Object Name, InterfaceDescription, MacAddress, Status
```

```typescript
return {
  name: adapter.Name,
  type: isWireless ? 'wireless' : 'wired',
  mac: adapter.MacAddress ? adapter.MacAddress.replace(/-/g, ':').toLowerCase() : '',
  isUp: adapter.Status === 'Up',
  state: adapter.Status  // ★ 追加: 状態を保持（Up, Down, Disabled等）
};
```

### 4. UI表示の更新 (src/components/NetworkConfigTab.tsx)

#### a) アイコン・Chipコンポーネントのインポート (23行目)
```typescript
import { Visibility, VisibilityOff, CheckCircle, Error, Warning } from '@mui/icons-material';
import { ..., Chip } from '@mui/material';
```

#### b) 状態表示用のヘルパー関数 (39-83行目)
```typescript
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
```

#### c) アダプタ選択リストの更新 (273-283行目)
```tsx
{adapters.map((adapter) => (
  <MenuItem key={adapter.name} value={adapter.name}>
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        {adapter.name} ({adapter.type === 'wireless' ? '無線' : '有線'}) - {adapter.mac}
        {adapter.currentIP && ` - ${adapter.currentIP}`}
      </Box>
      {getStateChip(adapter)}  {/* ★ 状態Chipを表示 */}
    </Box>
  </MenuItem>
))}
```

#### d) 詳細情報の状態表示 (298-303行目)
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
  <Typography variant="body2" color="text.secondary">
    接続状態:
  </Typography>
  <Box sx={{ ml: 1 }}>{getStateChip(currentAdapter)}</Box>
</Box>
```

#### e) 切断中の警告メッセージ (329-333行目)
```tsx
{!currentAdapter.isUp && (
  <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
    このアダプタは現在切断されています。設定を変更して接続を試みることができます。
  </Alert>
)}
```

---

## 📊 表示される状態

### Linux (`nmcli device status`)
| 状態 | 表示 | 色 | アイコン |
|------|------|-----|---------|
| `connected` | 接続中 | 緑 (success) | CheckCircle |
| `disconnected` | 切断 | 赤 (error) | Error |
| `unavailable` | 無効 | 黄 (warning) | Warning |
| その他 | 状態名 | グレー (default) | Warning |

### Windows (`Get-NetAdapter Status`)
| 状態 | 表示 | 色 | アイコン |
|------|------|-----|---------|
| `Up` | 接続中 | 緑 (success) | CheckCircle |
| `Down` | 切断 | 赤 (error) | Error |
| `Disabled` | 無効 | 黄 (warning) | Warning |
| その他 | 状態名 | グレー (default) | Warning |

---

## 🎯 修正の効果

### Before（修正前）
❌ IPアドレス設定ミス
↓
❌ アダプタが `disconnected` / `Down` 状態
↓
❌ リストに表示されない
↓
❌ **修正不可能**

### After（修正後）
✅ IPアドレス設定ミス
↓
✅ アダプタが `disconnected` / `Down` 状態
↓
✅ **リストに表示される（状態: 切断）**
↓
✅ **設定を修正可能**

---

## 🖼️ UI イメージ

### アダプタ選択リスト
```
┌─────────────────────────────────────────────────┐
│ wlan0 (無線) - aa:bb:cc:dd:ee:ff - 192.168.1.10 │ [接続中]
│ eth0 (有線) - 11:22:33:44:55:66                 │ [切断]
│ eth1 (有線) - 66:77:88:99:aa:bb                 │ [無効]
└─────────────────────────────────────────────────┘
```

### 詳細情報
```
アダプタ情報
種別: 有線
MACアドレス: 11:22:33:44:55:66
接続状態: [切断]

⚠️ このアダプタは現在切断されています。設定を変更して接続を試みることができます。

IP設定モード: 手動設定
IPアドレス: 192.168.1.100
サブネットマスク: 255.255.255.0
ゲートウェイ: 192.168.1.1
```

---

## ✅ テスト方法

### 手動テスト（Linux）

1. **正常な接続状態の確認**
```bash
sudo nmcli device status
# wlan0  wifi  connected  ...
```

2. **意図的に切断**
```bash
sudo nmcli con down "接続名"
sudo nmcli device status
# wlan0  wifi  disconnected  --
```

3. **アプリでアダプタリストを確認**
   - 設定 → ネットワーク設定タブ
   - 切断中のアダプタが表示されることを確認
   - 状態が「切断」と表示されることを確認

4. **設定を修正して接続**
   - 正しいIPアドレス、サブネット、ゲートウェイを入力
   - 「設定を適用」をクリック
   - 接続が回復することを確認

### 手動テスト（Windows）

1. **アダプタを無効化**
```powershell
Disable-NetAdapter -Name "イーサネット" -Confirm:$false
Get-NetAdapter
# Name       Status
# イーサネット  Disabled
```

2. **アプリでアダプタリストを確認**
   - 設定 → ネットワーク設定タブ
   - 無効化されたアダプタが表示されることを確認

3. **アダプタを有効化**
```powershell
Enable-NetAdapter -Name "イーサネット"
```

---

## 📝 注意事項

1. **loopbackインターフェース (`lo`) は除外**
   - Linuxの loopback インターフェースはリストから除外されます

2. **状態の多様性**
   - OSやネットワーク環境によって、表示される状態は異なります
   - 未知の状態は状態名そのままで表示されます

3. **接続試行**
   - 切断中のアダプタでも設定は可能ですが、接続成功を保証するものではありません
   - ネットワーク設定（SSID、パスワード、IPアドレス等）が正しいことを確認してください

---

## 🔗 関連ファイル

- [src/types/index.ts](src/types/index.ts) - 型定義
- [src/main.ts](src/main.ts) - バックエンドロジック
- [src/components/NetworkConfigTab.tsx](src/components/NetworkConfigTab.tsx) - UIコンポーネント

---

## 📞 トラブルシューティング

### アダプタが表示されない

```bash
# Linux: nmcliでアダプタを確認
sudo nmcli device status

# Windows: PowerShellでアダプタを確認
Get-NetAdapter
```

### 状態が「不明」と表示される

- OSから返される状態が標準的でない場合があります
- ログを確認してください:
```bash
# Electronアプリのログ
tail -f ~/.cache/kiosk-script.log
```

---

## ✨ 実装者

- Claude Code (Anthropic)
- 修正日: 2024-11-11

---

## 📜 ライセンス

本プロジェクトのライセンスに準じます（MIT License）。
