import React from 'react';
import { DownloadResult } from '../types/data';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { STATUS_LABELS } from '../localization/constants/status-labels';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';

interface ResultDialogProps {
  open: boolean;
  onClose: () => void;
  results: DownloadResult[];
}

/**
 * ResultDialog コンポーネント
 * 
 * ダウンロード結果を表示するダイアログコンポーネント。
 * shadcn/ui Dialogコンポーネントを使用して統一されたスタイルを提供します。
 * 
 * @param open - ダイアログの表示状態
 * @param onClose - ダイアログを閉じる際のコールバック
 * @param results - ダウンロード結果の配列
 */
const ResultDialog: React.FC<ResultDialogProps> = ({ open, onClose, results }) => {
  // 結果の統計を計算
  const successCount = results.filter(result => result.success).length;
  const failureCount = results.length - successCount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {SETTINGS_LABELS.DOWNLOAD_COMPLETED}
          </DialogTitle>
          <DialogDescription>
            ダウンロード処理が完了しました。結果を確認してください。
          </DialogDescription>
        </DialogHeader>
        
        {/* 結果サマリー */}
        {results.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="text-green-600 border-green-200">
              {STATUS_LABELS.SUCCESS}: {successCount}
            </Badge>
            {failureCount > 0 && (
              <Badge variant="destructive">
                {STATUS_LABELS.FAILED}: {failureCount}
              </Badge>
            )}
          </div>
        )}

        {/* 結果リスト */}
        <ScrollArea className="max-h-80">
          <div className="space-y-3">
            {results.map((result) => (
              <div 
                key={result.deviceId} 
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {result.deviceName}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
            
            {results.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  {SETTINGS_LABELS.DATA_NOT_EXISTS}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            {ACTION_LABELS.CLOSE}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialog;