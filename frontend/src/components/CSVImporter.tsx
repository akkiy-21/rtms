import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { AlarmAddress, AlarmComment } from '../types/alarm';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Upload, File, X } from 'lucide-react';
import { ACTION_LABELS } from '../localization/constants/action-labels';
import { TECHNICAL_TERMS } from '../localization/constants/technical-terms';
import { SETTINGS_LABELS } from '../localization/constants/settings-labels';
import { MESSAGE_FORMATTER } from '../localization/utils/message-formatter';

interface CSVImporterProps {
  onImport: (addresses: AlarmAddress[], commentCount?: number) => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onImport }) => {
  const [encoding, setEncoding] = useState<string>('Shift_JIS');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      readFile(selectedFile);
    }
  }, [encoding, selectedFile]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        console.warn(MESSAGE_FORMATTER.ERROR_FILE_FORMAT());
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const { addresses, commentCount } = parseCSV(csv);
      onImport(addresses, commentCount);
    };
    reader.onerror = (e) => {
      console.error(SETTINGS_LABELS.FILE_READING_ERROR, e);
    };
    reader.readAsText(file, encoding);
  };

  const parseCSV = (csv: string): { addresses: AlarmAddress[], commentCount: number } => {
    try {
      const lines = csv.split('\n');
      const addresses: AlarmAddress[] = [];
      let maxComments = 0;

      // Format patterns
      const oldFormatRegex = /\[(\d+)\]D(\d+)\s*:(\d+)/;
      const newFormatRegex = /D(\d+)_(\d+)\s*:(\d+)/;
      const newFormatRegex2 = /^(\d+),\[PLC\d+\](\d+\.\d{2}),\d,(.*?)(?=\s*,|$)/;

    lines.slice(1).forEach((line, index) => {
      // Skip empty lines
      if (!line.trim()) return;

      const oldFormatMatch = line.match(oldFormatRegex);
      const newFormatMatch = line.match(newFormatRegex);
      const newFormatMatch2 = line.match(newFormatRegex2);

      if (oldFormatMatch) {
        const [, , address, bit] = oldFormatMatch;
        const comments: AlarmComment[] = line.split(',').slice(1).map((comment, i) => ({
          comment_id: i + 1,
          comment: comment.trim().replace(/^"|"$/g, ''),
        })).filter(comment => comment.comment !== '');

        maxComments = Math.max(maxComments, comments.length);

        addresses.push({
          alarm_no: index,
          address_type: 'D',
          address: address.padStart(4, '0'),
          address_bit: parseInt(bit),
          comments: comments,
        });
      } else if (newFormatMatch) {
        const [, address, bit] = newFormatMatch;
        const comments: AlarmComment[] = line.split(',').slice(1).map((comment, i) => ({
          comment_id: i + 1,
          comment: comment.trim().replace(/^"|"$/g, ''),
        })).filter(comment => comment.comment !== '');

        maxComments = Math.max(maxComments, comments.length);

        addresses.push({
          alarm_no: index,
          address_type: 'D',
          address: address.padStart(4, '0'),
          address_bit: parseInt(bit),
          comments: comments,
        });
      } else if (newFormatMatch2) {
        const [, no, address, comment] = newFormatMatch2;
        const addressParts = address.split('.');
        const addressNumber = addressParts[0];
        const bit = addressParts[1];

        addresses.push({
          alarm_no: parseInt(no),
          address_type: '',
          address: parseInt(addressNumber).toString().padStart(4, '0'),
          address_bit: parseInt(bit),
          comments: [{
            comment_id: 1,
            comment: comment.trim().replace(/^"|"$/g, ''),
          }],
        });

        maxComments = Math.max(maxComments, 1);
      }
    });

      // Sort addresses by alarm_no
      addresses.sort((a, b) => a.alarm_no - b.alarm_no);

      return { addresses, commentCount: maxComments };
    } catch (error) {
      console.error(SETTINGS_LABELS.CSV_PARSE_ERROR, error);
      return { addresses: [], commentCount: 0 };
    }
  };

  const handleEncodingChange = (value: string) => {
    setEncoding(value);
  };

  return (
    <div className="space-y-4">
      {/* エンコーディング選択 */}
      <div className="space-y-2">
        <Label htmlFor="encoding-select">{SETTINGS_LABELS.ENCODING_FORMAT}</Label>
        <Select value={encoding} onValueChange={handleEncodingChange}>
          <SelectTrigger id="encoding-select" className="w-full sm:w-[200px]">
            <SelectValue placeholder={SETTINGS_LABELS.SELECT_ENCODING} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Shift_JIS">Shift_JIS</SelectItem>
            <SelectItem value="UTF-8">UTF-8</SelectItem>
            <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
            <SelectItem value="EUC-JP">EUC-JP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ファイルアップロード領域 */}
      <Card className={`transition-colors ${isDragOver ? 'border-primary bg-primary/5' : 'border-dashed'}`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center space-y-4 text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              // ファイル選択済みの表示
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg w-full max-w-sm">
                <File className="h-8 w-8 text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} {TECHNICAL_TERMS.KB}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // ファイル未選択の表示
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">{SETTINGS_LABELS.UPLOAD_CSV_FILE}</p>
                  <p className="text-sm text-muted-foreground">
                    {SETTINGS_LABELS.DRAG_DROP_FILE}
                  </p>
                </div>
                <Button onClick={handleButtonClick} className="mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  {SETTINGS_LABELS.SELECT_FILE}
                </Button>
              </>
            )}
            
            {/* 隠しファイル入力 */}
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".csv"
            />
          </div>
        </CardContent>
      </Card>

      {/* ファイル形式の説明 */}
      <div className="text-sm text-muted-foreground">
        <p>{SETTINGS_LABELS.SUPPORTED_FORMAT}: {TECHNICAL_TERMS.CSV} (.csv)</p>
        <p>{SETTINGS_LABELS.FILE_FORMAT_DESCRIPTION}</p>
        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
          <li>{SETTINGS_LABELS.FORMAT_OLD_STYLE}</li>
          <li>{SETTINGS_LABELS.FORMAT_NEW_STYLE}</li>
          <li>{SETTINGS_LABELS.FORMAT_EXTENDED}</li>
        </ul>
      </div>
    </div>
  );
};

export default CSVImporter;