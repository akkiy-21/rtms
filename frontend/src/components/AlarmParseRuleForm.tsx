import React, { useEffect, useState } from 'react';
import { CircleHelp, Plus, Trash2 } from 'lucide-react';
import {
  AlarmParseRuleFormData,
  AlarmParseRulePatternFormData,
} from '@/types/alarm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AlarmParseRuleFormProps {
  initialData?: AlarmParseRuleFormData;
  onSubmit: (data: AlarmParseRuleFormData) => void;
  children?: React.ReactNode;
}

interface HelpLabelProps {
  htmlFor?: string;
  tooltip: string;
  children: React.ReactNode;
}

const createEmptyPattern = (): AlarmParseRulePatternFormData => ({
  pattern_name: '',
  sort_order: 1,
  regex_pattern: '',
  address_type_value: '',
  address_type_group: null,
  alarm_no_mode: 'line_index',
  alarm_no_group: null,
  alarm_no_offset: 0,
  address_group: null,
  bit_group: null,
  combined_address_bit_group: null,
  combined_address_bit_separator: '.',
  comment_mode: 'none',
  comment_group: null,
  comment_columns_start: null,
  address_pad_length: 4,
});

const createDefaultFormData = (): AlarmParseRuleFormData => ({
  name: '',
  description: '',
  is_active: true,
  skip_header_rows: 1,
  offset_mode: 'row_index_word',
  patterns: [createEmptyPattern()],
});

const patternHelpText: Record<string, string> = {
  legacy_d_format: 'Keyence VTシリーズの [番号]Dアドレス:ビット 形式向けです。',
  d_underscore_format: 'D1234_05:1 のような Dアンダースコア形式向けです。',
  plc_export_format: 'GP-Pro EX の Alarm Data CSV から Bit Log セクションを読む想定です。',
};

const HelpLabel: React.FC<HelpLabelProps> = ({ htmlFor, tooltip, children }) => (
  <div className="flex items-center gap-1.5">
    <Label htmlFor={htmlFor}>{children}</Label>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          aria-label={`${typeof children === 'string' ? children : '項目'} の説明`}
        >
          <CircleHelp className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="leading-relaxed">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

const AlarmParseRuleForm: React.FC<AlarmParseRuleFormProps> = ({
  initialData,
  onSubmit,
  children,
}) => {
  const [formData, setFormData] = useState<AlarmParseRuleFormData>(
    initialData ?? createDefaultFormData(),
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData ?? createDefaultFormData());
  }, [initialData]);

  const updateField = <K extends keyof AlarmParseRuleFormData>(
    key: K,
    value: AlarmParseRuleFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updatePatternField = <K extends keyof AlarmParseRulePatternFormData>(
    index: number,
    key: K,
    value: AlarmParseRulePatternFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      patterns: current.patterns.map((pattern, patternIndex) =>
        patternIndex === index
          ? {
              ...pattern,
              [key]: value,
            }
          : pattern,
      ),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFormError('ルール名を入力してください。');
      return;
    }

    if (formData.patterns.length === 0) {
      setFormError('少なくとも1つのパターンを設定してください。');
      return;
    }

    if (
      formData.patterns.some(
        (pattern) => !pattern.pattern_name.trim() || !pattern.regex_pattern.trim(),
      )
    ) {
      setFormError('パターン名と正規表現は必須です。');
      return;
    }

    setFormError(null);
    onSubmit(formData);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-dashed bg-muted/30">
        <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Keyence VTシリーズ</Badge>
            <Badge variant="outline">Dアンダースコア形式</Badge>
            <Badge variant="outline">GP-Pro EX</Badge>
          </div>
          <p>
            まずルール名と説明を決め、その後に各パターンでどの値を取り出すかを設定します。
          </p>
          <p>
            すべての項目を毎回使う必要はありません。モードに応じて必要な入力だけ表示されます。
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <HelpLabel
            htmlFor="rule-name"
            tooltip="CSV取込前の選択画面に表示されるルール名です。装置やCSV種別が分かる名前にします。"
          >
            ルール名
          </HelpLabel>
          <Input
            id="rule-name"
            value={formData.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="例: GP-Pro EX"
          />
          <p className="text-xs text-muted-foreground">
            ユーザーが選択画面で見る名称です。
          </p>
        </div>

        <div className="space-y-2">
          <HelpLabel
            htmlFor="skip-header-rows"
            tooltip="CSV冒頭の説明行や見出し行を何行読み飛ばすかの既定値です。"
          >
            スキップするヘッダ行数
          </HelpLabel>
          <Input
            id="skip-header-rows"
            type="number"
            min={0}
            value={formData.skip_header_rows}
            onChange={(event) => updateField('skip_header_rows', Number(event.target.value || 0))}
          />
          <p className="text-xs text-muted-foreground">
            CSVの先頭に固定ヘッダがある場合の既定値です。
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <HelpLabel
          htmlFor="rule-description"
          tooltip="このルールがどのCSVに対応するかを管理者向けに説明します。"
        >
          説明
        </HelpLabel>
        <Textarea
          id="rule-description"
          value={formData.description ?? ''}
          onChange={(event) => updateField('description', event.target.value)}
          rows={3}
          placeholder="このルールの用途を入力します"
        />
        <p className="text-xs text-muted-foreground">
          例: GP-Pro EX の Alarm Data CSV から Bit Log セクションを解釈します。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <HelpLabel
            htmlFor="offset-mode"
            tooltip="取込後にアドレス補正をかける時、元CSVのアドレスを基準にするか、行番号から再計算するかを決めます。"
          >
            オフセット適用モード
          </HelpLabel>
          <Select
            value={formData.offset_mode}
            onValueChange={(value) =>
              updateField('offset_mode', value as AlarmParseRuleFormData['offset_mode'])
            }
          >
            <SelectTrigger id="offset-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="row_index_word">行番号ベース</SelectItem>
              <SelectItem value="preserve_address">元アドレスベース</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            CSV内の元アドレスを使うか、行番号からワードを再計算するかを選びます。
          </p>
        </div>

        <div className="space-y-2">
          <HelpLabel
            htmlFor="rule-active"
            tooltip="無効にすると既存設定は残したまま、新規選択候補から外せます。"
          >
            有効状態
          </HelpLabel>
          <div className="flex h-10 items-center gap-3 rounded-md border px-3">
            <Switch
              id="rule-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => updateField('is_active', checked)}
            />
            <span className="text-sm text-muted-foreground">
              {formData.is_active ? '有効' : '無効'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">パターン設定</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateField('patterns', [...formData.patterns, createEmptyPattern()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            パターン追加
          </Button>
        </div>

        {formData.patterns.map((pattern, index) => {
          const isCombinedAddress = pattern.combined_address_bit_group !== null;
          const usesAddressTypeGroup = pattern.address_type_group !== null;
          const patternHelp = patternHelpText[pattern.pattern_name];

          return (
            <Card key={`${pattern.pattern_name}-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-sm">パターン {index + 1}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      1つのCSVルールの中で、どの行形式にマッチさせるかを定義します。
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateField(
                        'patterns',
                        formData.patterns.filter((_, patternIndex) => patternIndex !== index),
                      )
                    }
                    disabled={formData.patterns.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {patternHelp && (
                  <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                    {patternHelp}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <HelpLabel
                      tooltip="このパターンの内部識別子です。同じルール内で役割が分かる名前にします。"
                    >
                      パターン名
                    </HelpLabel>
                    <Input
                      value={pattern.pattern_name}
                      onChange={(event) =>
                        updatePatternField(index, 'pattern_name', event.target.value)
                      }
                      placeholder="例: plc_export_format"
                    />
                    <p className="text-xs text-muted-foreground">
                      内部識別子です。後で見て分かる名前にしてください。
                    </p>
                  </div>

                  <div className="space-y-2">
                    <HelpLabel tooltip="小さい番号から順に評価されます。複数候補がある時は優先したい形式を先に置きます。">
                      並び順
                    </HelpLabel>
                    <Input
                      type="number"
                      value={pattern.sort_order}
                      onChange={(event) =>
                        updatePatternField(index, 'sort_order', Number(event.target.value || 0))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      小さい順に評価されます。
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <HelpLabel tooltip="CSVの1行から必要な値を取り出す正規表現です。後続項目で使う番号付きグループもここで定義します。">
                    正規表現
                  </HelpLabel>
                  <Textarea
                    value={pattern.regex_pattern}
                    onChange={(event) =>
                      updatePatternField(index, 'regex_pattern', event.target.value)
                    }
                    rows={3}
                    placeholder="例: ^(\\d+),\\[PLC\\d+\\](\\d+\\.\\d{2}),\\d,(.*?)$"
                  />
                  <p className="text-xs text-muted-foreground">
                    正規表現グループを使う項目だけ、下でグループ番号を指定します。
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">アドレス種別</h4>
                  <p className="text-xs text-muted-foreground">
                    アドレスタイプのグループ番号が設定されていれば正規表現グループを使い、未設定なら固定アドレスタイプを使います。
                  </p>
                </div>

                <div className="rounded-md border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <HelpLabel tooltip="ON で正規表現グループから取得、OFF で固定アドレスタイプを使います。">
                        正規表現グループから取得
                      </HelpLabel>
                      <p className="text-xs text-muted-foreground">
                        {usesAddressTypeGroup
                          ? '現在は正規表現グループからアドレスタイプを取得します。'
                          : '現在は固定アドレスタイプを使います。'}
                      </p>
                    </div>
                    <Switch
                      checked={usesAddressTypeGroup}
                      onCheckedChange={(checked) =>
                        updatePatternField(index, 'address_type_group', checked ? (pattern.address_type_group ?? 1) : null)
                      }
                      aria-label="アドレスタイプ取得方法の切り替え"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {usesAddressTypeGroup ? (
                    <div className="space-y-2">
                      <HelpLabel tooltip="設定するとこちらが優先されます。正規表現の何番目のグループから D や W のようなアドレス種別を取るかを指定します。">
                        アドレスタイプのグループ番号
                      </HelpLabel>
                      <Input
                        type="number"
                        value={pattern.address_type_group ?? ''}
                        onChange={(event) =>
                          updatePatternField(
                            index,
                            'address_type_group',
                            event.target.value === '' ? null : Number(event.target.value),
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        例: `(D|W)(\\d+)` なら、D または W を取るグループ番号を指定します。
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <HelpLabel tooltip="D や W など、毎回同じアドレス種別を使う場合に入力します。アドレスタイプのグループ番号を設定しない場合に使われます。">
                        固定アドレスタイプ
                      </HelpLabel>
                      <Input
                        value={pattern.address_type_value ?? ''}
                        onChange={(event) =>
                          updatePatternField(index, 'address_type_value', event.target.value)
                        }
                        placeholder="例: D"
                      />
                      <p className="text-xs text-muted-foreground">
                        D や W のように常に同じ値を使う場合に入力します。
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <HelpLabel tooltip="数値アドレスを何桁で保存するかです。4なら 12 を 0012 として扱います。">
                      アドレスゼロ埋め桁数
                    </HelpLabel>
                    <Input
                      type="number"
                      min={1}
                      value={pattern.address_pad_length}
                      onChange={(event) =>
                        updatePatternField(
                          index,
                          'address_pad_length',
                          Number(event.target.value || 1),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      数値アドレスを 12 から 0012 のように整形します。
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">アラーム番号</h4>
                  <p className="text-xs text-muted-foreground">
                    行番号を使うか、正規表現のグループから取得するかを選びます。
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <HelpLabel tooltip="アラーム番号をCSVの行順から採番するか、正規表現のグループから取得するかを選びます。">
                      アラーム番号モード
                    </HelpLabel>
                    <Select
                      value={pattern.alarm_no_mode}
                      onValueChange={(value) =>
                        updatePatternField(
                          index,
                          'alarm_no_mode',
                          value as AlarmParseRulePatternFormData['alarm_no_mode'],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line_index">行番号</SelectItem>
                        <SelectItem value="regex_group">正規表現グループ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {pattern.alarm_no_mode === 'regex_group' && (
                    <div className="space-y-2">
                      <HelpLabel tooltip="正規表現のどのグループをアラーム番号として読むかを指定します。">
                        アラーム番号のグループ番号
                      </HelpLabel>
                      <Input
                        type="number"
                        value={pattern.alarm_no_group ?? ''}
                        onChange={(event) =>
                          updatePatternField(
                            index,
                            'alarm_no_group',
                            event.target.value === '' ? null : Number(event.target.value),
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        例: ^(1),... の先頭を使うなら 1 を指定します。
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <HelpLabel tooltip="取得したアラーム番号に加減算する補正値です。0始まりCSVを1始まりに合わせる時などに使います。">
                      アラーム番号オフセット
                    </HelpLabel>
                    <Input
                      type="number"
                      value={pattern.alarm_no_offset}
                      onChange={(event) =>
                        updatePatternField(
                          index,
                          'alarm_no_offset',
                          Number(event.target.value || 0),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      0始まりと1始まりの差分補正に使います。
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">アドレスとビット</h4>
                  <p className="text-xs text-muted-foreground">
                    別々のグループで取るか、5000.01 のような結合値を分解するかを選びます。
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {!isCombinedAddress && (
                    <>
                      <div className="space-y-2">
                        <HelpLabel tooltip="正規表現の何番目のグループからワードアドレス本体を取るかを指定します。">
                          アドレスのグループ番号
                        </HelpLabel>
                        <Input
                          type="number"
                          value={pattern.address_group ?? ''}
                          onChange={(event) =>
                            updatePatternField(
                              index,
                              'address_group',
                              event.target.value === '' ? null : Number(event.target.value),
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <HelpLabel tooltip="正規表現の何番目のグループからビット番号を取るかを指定します。">
                          ビットのグループ番号
                        </HelpLabel>
                        <Input
                          type="number"
                          value={pattern.bit_group ?? ''}
                          onChange={(event) =>
                            updatePatternField(
                              index,
                              'bit_group',
                              event.target.value === '' ? null : Number(event.target.value),
                            )
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <HelpLabel tooltip="5000.01 のようにアドレスとビットが1つの文字列にまとまっている時、その文字列を取るグループ番号です。">
                      結合アドレスのグループ番号
                    </HelpLabel>
                    <Input
                      type="number"
                      value={pattern.combined_address_bit_group ?? ''}
                      onChange={(event) =>
                        updatePatternField(
                          index,
                          'combined_address_bit_group',
                          event.target.value === '' ? null : Number(event.target.value),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      5000.01 のように1つの値から分解する場合だけ使います。
                    </p>
                  </div>

                  {isCombinedAddress && (
                    <div className="space-y-2">
                      <HelpLabel tooltip="結合アドレスを分解する区切り文字です。通常は . や _ を指定します。">
                        結合アドレスの区切り文字
                      </HelpLabel>
                      <Input
                        value={pattern.combined_address_bit_separator}
                        onChange={(event) =>
                          updatePatternField(
                            index,
                            'combined_address_bit_separator',
                            event.target.value || '.',
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">コメント</h4>
                  <p className="text-xs text-muted-foreground">
                    コメントなし、CSV列から取得、正規表現グループから取得のいずれかを選びます。
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <HelpLabel tooltip="コメントを使わないか、CSV列から読むか、正規表現グループから読むかを選びます。">
                      コメントモード
                    </HelpLabel>
                    <Select
                      value={pattern.comment_mode}
                      onValueChange={(value) =>
                        updatePatternField(
                          index,
                          'comment_mode',
                          value as AlarmParseRulePatternFormData['comment_mode'],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">なし</SelectItem>
                        <SelectItem value="csv_columns">CSV列</SelectItem>
                        <SelectItem value="regex_group">正規表現グループ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {pattern.comment_mode === 'regex_group' && (
                    <div className="space-y-2">
                      <HelpLabel tooltip="正規表現のどのグループをコメント本文として読むかを指定します。">
                        コメントのグループ番号
                      </HelpLabel>
                      <Input
                        type="number"
                        value={pattern.comment_group ?? ''}
                        onChange={(event) =>
                          updatePatternField(
                            index,
                            'comment_group',
                            event.target.value === '' ? null : Number(event.target.value),
                          )
                        }
                      />
                    </div>
                  )}

                  {pattern.comment_mode === 'csv_columns' && (
                    <div className="space-y-2">
                      <HelpLabel tooltip="コメントが始まるCSV列の位置です。この列以降を連結してコメントに使います。">
                        コメント開始列
                      </HelpLabel>
                      <Input
                        type="number"
                        value={pattern.comment_columns_start ?? ''}
                        onChange={(event) =>
                          updatePatternField(
                            index,
                            'comment_columns_start',
                            event.target.value === '' ? null : Number(event.target.value),
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        コメントが連続する最初の列位置を指定します。
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}
      {children}
      </form>
    </TooltipProvider>
  );
};

export default AlarmParseRuleForm;
