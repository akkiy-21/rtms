import React, { useEffect, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Upload } from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApiError } from '@/hooks/use-api-error';
import { useToast } from '@/hooks/use-toast';
import { DataTableColumnHeader } from '@/components/common/data-table-column-header';
import { NAVIGATION_LABELS } from '@/localization/constants/navigation-labels';
import { listAppReleases, uploadAppRelease } from '@/services/api';
import { AppRelease } from '@/types/device';

const AppReleasesPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { handleError } = useApiError();
  const { toast } = useToast();
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');

  const fetchReleases = React.useCallback(async () => {
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

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const handleUpload = async () => {
    if (!selectedFile || !version.trim()) {
      return;
    }

    try {
      setUploading(true);
      await uploadAppRelease(version.trim(), selectedFile, notes.trim() || undefined);
      toast({
        title: 'リリースを登録しました',
        description: `${version.trim()} をアップロードしました`,
      });
      setSelectedFile(null);
      setVersion('');
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchReleases();
    } catch (err) {
      handleError(err);
    } finally {
      setUploading(false);
    }
  };

  const columns: ColumnDef<AppRelease>[] = [
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
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={fetchReleases} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={NAVIGATION_LABELS.APP_RELEASES}
        description="rtms-client の更新用 ZIP を登録して、デバイス一覧から配信できるようにします"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">rtms-client リリース登録</CardTitle>
          <CardDescription>Linux ARM64 向けの ZIP ファイルをアップロードします</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Version</label>
              <Input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="1.0.5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ZIP ファイル</label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">メモ</label>
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="任意の説明" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {selectedFile ? `${selectedFile.name} / ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'ZIP ファイルを選択してください'}
            </div>
            <Button type="button" disabled={!selectedFile || !version.trim() || uploading} onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? '登録中...' : 'リリース登録'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={releases}
        searchKey="version"
        searchPlaceholder="Version で検索"
      />
    </div>
  );
};

export default AppReleasesPage;