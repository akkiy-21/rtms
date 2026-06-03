import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, SkipForward, Trash2, Upload, XCircle } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ConfirmationDialog } from '@/components/common/confirmation-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import {
  cancelDeviceActionJob,
  deleteAppRelease,
  listAppReleases,
  listDeviceActionJobs,
  uploadAppRelease,
} from '@/services/api';
import { AppRelease, DeviceActionJob, DeviceActionJobItem, DeviceActionJobStatus } from '@/types/device';

const JOBS_PER_PAGE = 20;

const ACTIVE_STATUSES: DeviceActionJobStatus[] = ['queued', 'running', 'cancel_requested'];

const STATUS_BADGE: Record<DeviceActionJobStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  queued:           { label: '待機中',         variant: 'secondary' },
  running:          { label: '実行中',         variant: 'default' },
  succeeded:        { label: '成功',           variant: 'default' },
  failed:           { label: '失敗',           variant: 'destructive' },
  partial:          { label: '一部成功',       variant: 'outline' },
  cancel_requested: { label: 'キャンセル中',   variant: 'outline' },
  cancelled:        { label: 'キャンセル済み', variant: 'secondary' },
};

const ACTION_TYPE_LABEL: Record<string, string> = {
  reboot:              '再起動',
  shutdown:            'シャットダウン',
  deploy_rtms_client:  'アプリ配信',
};

function ItemStatusIcon({ status }: { status: DeviceActionJobItem['status'] }) {
  if (status === 'succeeded') return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
  if (status === 'skipped') return <SkipForward className="h-4 w-4 text-muted-foreground" />;
  if (status === 'running') return <Loader2 className="h-4 w-4 animate-spin" />;
  return <span className="h-4 w-4 rounded-full border border-muted-foreground inline-block" />;
}

const AppReleasesPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { handleError } = useApiError();
  const { toast } = useToast();

  // --- Releases ---
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [releaseToDelete, setReleaseToDelete] = useState<AppRelease | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Jobs ---
  const [jobTotal, setJobTotal] = useState(0);
  const [jobs, setJobs] = useState<DeviceActionJob[]>([]);
  const [jobPage, setJobPage] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<DeviceActionJob | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedReleases = await listAppReleases();
      setReleases(fetchedReleases);
    } catch (err) {
      setError('アプリ配信リリースの取得に失敗しました');
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchJobs = useCallback(async (page: number) => {
    try {
      setJobsLoading(true);
      const result = await listDeviceActionJobs(page, JOBS_PER_PAGE);
      setJobTotal(result.total);
      setJobs(result.items);
    } catch (err) {
      handleError(err);
    } finally {
      setJobsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  useEffect(() => {
    fetchJobs(jobPage);
  }, [fetchJobs, jobPage]);

  // アクティブなジョブがあるときのポーリング（2秒間隔）
  useEffect(() => {
    const hasActive = jobs.some((j) => (ACTIVE_STATUSES as string[]).includes(j.status));
    if (!hasActive) return;

    const id = window.setInterval(() => {
      void fetchJobs(jobPage);
    }, 2000);

    return () => window.clearInterval(id);
  }, [jobs, jobPage, fetchJobs]);

  // Sheet が開いている間は selectedJob を最新データに同期
  useEffect(() => {
    if (!selectedJob) return;
    const updated = jobs.find((j) => j.id === selectedJob.id);
    if (updated) setSelectedJob(updated);
  }, [jobs]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async () => {
    if (!selectedFile || !version.trim()) return;

    try {
      setUploading(true);
      await uploadAppRelease(version.trim(), selectedFile, notes.trim() || undefined);
      toast({ title: 'リリースを登録しました', description: `${version.trim()} をアップロードしました` });
      setSelectedFile(null);
      setVersion('');
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchReleases();
    } catch (err) {
      handleError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!releaseToDelete) return;
    try {
      setDeleting(true);
      await deleteAppRelease(releaseToDelete.id);
      toast({ title: 'リリースを削除しました', description: `${releaseToDelete.version} を削除しました` });
      setReleaseToDelete(null);
      await fetchReleases();
    } catch (err) {
      handleError(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelJob = async (job: DeviceActionJob) => {
    try {
      setCancelling(true);
      const updated = await cancelDeviceActionJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      if (selectedJob?.id === updated.id) setSelectedJob(updated);
      toast({ title: 'キャンセルを要求しました', description: `ジョブ #${job.id} のキャンセルを受け付けました` });
    } catch (err) {
      handleError(err);
    } finally {
      setCancelling(false);
    }
  };

  const releaseColumns: ColumnDef<AppRelease>[] = [
    {
      accessorKey: 'version',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Version" />,
      cell: ({ row }) => <span className="font-medium">{row.original.version}</span>,
    },
    {
      accessorKey: 'filename',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ファイル名" />,
    },
    {
      accessorKey: 'file_size',
      header: ({ column }) => <DataTableColumnHeader column={column} title="サイズ" />,
      cell: ({ row }) => <span>{(row.original.file_size / 1024 / 1024).toFixed(2)} MB</span>,
    },
    {
      accessorKey: 'sha256',
      header: 'SHA256',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sha256.slice(0, 12)}...</span>,
    },
    {
      accessorKey: 'uploaded_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="登録日時" />,
      cell: ({ row }) => <span>{new Date(row.original.uploaded_at).toLocaleString('ja-JP')}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setReleaseToDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const totalJobPages = Math.max(1, Math.ceil(jobTotal / JOBS_PER_PAGE));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retry={fetchReleases} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.APP_RELEASES}
        description="rtms-client の更新用 ZIP を登録して、デバイス一覧から配信できるようにします"
      />

      {/* リリース登録フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">rtms-client リリース登録</CardTitle>
          <CardDescription>Linux ARM64 向けの ZIP ファイルをアップロードします</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ZIP ファイル</label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">メモ</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="任意の説明" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedFile
                ? `${selectedFile.name} / ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : 'ZIP ファイルを選択してください'}
            </div>
            <Button type="button" disabled={!selectedFile || !version.trim() || uploading} onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? '登録中...' : 'リリース登録'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* リリース一覧 */}
      <DataTable
        columns={releaseColumns}
        data={releases}
        searchKey="version"
        searchPlaceholder="Version で検索"
      />

      {/* ジョブ履歴 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">ジョブ履歴</CardTitle>
              <CardDescription>配信・再起動・シャットダウンのジョブ一覧（全 {jobTotal} 件）</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => fetchJobs(jobPage)}>
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {jobsLoading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">ジョブはありません</div>
          ) : (
            <div className="divide-y">
              {jobs.map((job) => {
                const badgeInfo = STATUS_BADGE[job.status] ?? { label: job.status, variant: 'secondary' as const };
                const isActive = (ACTIVE_STATUSES as string[]).includes(job.status);
                return (
                  <div key={job.id} className="flex items-center gap-3 px-6 py-3">
                    <div className="w-8 text-right text-sm text-muted-foreground">#{job.id}</div>
                    <Badge variant={badgeInfo.variant} className="w-24 justify-center text-xs">
                      {badgeInfo.label}
                    </Badge>
                    <div className="w-24 text-sm">{ACTION_TYPE_LABEL[job.action_type] ?? job.action_type}</div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>対象 {job.total_items}</span>
                      <span className="text-green-600">成功 {job.succeeded_items}</span>
                      <span className="text-destructive">失敗 {job.failed_items}</span>
                      <span>スキップ {job.skipped_items}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      {new Date(job.requested_at).toLocaleString('ja-JP')}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedJob(job)}
                    >
                      詳細
                    </Button>
                    {isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive"
                        disabled={cancelling || job.status === 'cancel_requested'}
                        onClick={() => handleCancelJob(job)}
                      >
                        キャンセル
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {totalJobPages > 1 && (
            <div className="flex items-center justify-center gap-3 border-t px-6 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={jobPage === 0}
                onClick={() => setJobPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {jobPage + 1} / {totalJobPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={jobPage >= totalJobPages - 1}
                onClick={() => setJobPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* リリース削除確認 */}
      <ConfirmationDialog
        open={!!releaseToDelete}
        onOpenChange={(open) => { if (!open) setReleaseToDelete(null); }}
        title="リリースを削除"
        description={releaseToDelete ? `バージョン "${releaseToDelete.version}" を削除します。この操作は取り消せません。` : ''}
        confirmLabel="削除する"
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* ジョブ詳細 Sheet */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => { if (!open) setSelectedJob(null); }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedJob && (
            <>
              <SheetHeader>
                <SheetTitle>
                  ジョブ #{selectedJob.id} — {ACTION_TYPE_LABEL[selectedJob.action_type] ?? selectedJob.action_type}
                </SheetTitle>
                <SheetDescription>
                  <Badge variant={STATUS_BADGE[selectedJob.status]?.variant ?? 'secondary'}>
                    {STATUS_BADGE[selectedJob.status]?.label ?? selectedJob.status}
                  </Badge>
                  <span className="ml-2 text-xs">
                    {new Date(selectedJob.requested_at).toLocaleString('ja-JP')}
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="rounded border p-3 text-center text-sm">
                  <div className="text-muted-foreground text-xs">対象</div>
                  <div className="font-medium">{selectedJob.total_items}</div>
                </div>
                <div className="rounded border p-3 text-center text-sm">
                  <div className="text-green-600 text-xs">成功</div>
                  <div className="font-medium">{selectedJob.succeeded_items}</div>
                </div>
                <div className="rounded border p-3 text-center text-sm">
                  <div className="text-destructive text-xs">失敗</div>
                  <div className="font-medium">{selectedJob.failed_items}</div>
                </div>
                <div className="rounded border p-3 text-center text-sm">
                  <div className="text-muted-foreground text-xs">スキップ</div>
                  <div className="font-medium">{selectedJob.skipped_items}</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">デバイス別結果</h4>
                {selectedJob.items.length === 0 ? (
                  <div className="text-sm text-muted-foreground">なし</div>
                ) : (
                  <div className="divide-y rounded border">
                    {selectedJob.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                        <ItemStatusIcon status={item.status} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{item.device_name ?? `Device #${item.device_id}`}</div>
                          {item.last_known_ip_address && (
                            <div className="text-xs text-muted-foreground">{item.last_known_ip_address}</div>
                          )}
                          {item.result_message && (
                            <div className="mt-1 text-xs text-muted-foreground break-words">{item.result_message}</div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {item.finished_at ? new Date(item.finished_at).toLocaleTimeString('ja-JP') : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(ACTIVE_STATUSES as string[]).includes(selectedJob.status) && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={cancelling || selectedJob.status === 'cancel_requested'}
                    onClick={() => handleCancelJob(selectedJob)}
                  >
                    {selectedJob.status === 'cancel_requested' ? 'キャンセル中...' : 'このジョブをキャンセル'}
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppReleasesPage;
