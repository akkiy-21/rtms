# Design Document

## Overview

CSVパーサー機能強化は、現在の自動パース方式から、ユーザーが制御可能な柔軟なCSVインポート機能への移行を目的としています。この設計では、CSVファイルのプレビュー表示、パース設定の調整、バリデーション、そして最終的なデータインポートまでの一連のワークフローを提供します。

主要な改善点：
- インタラクティブなCSVプレビューテーブル
- ユーザー制御可能なパース設定（ヘッダー行、データ範囲、列マッピング）
- 設定テンプレートの保存・再利用機能
- 包括的なデータバリデーション
- 多様なCSV形式への対応

## Architecture

### システム構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   CSV Upload    │  │  Preview Table  │  │  Settings    │ │
│  │   Component     │  │   Component     │  │  Component   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Validation    │  │   Template      │  │   Import     │ │
│  │   Component     │  │   Manager       │  │  Component   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   CSV Parser    │  │   Validator     │  │   Template   │ │
│  │    Service      │  │    Service      │  │   Service    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Backend Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Alarm API     │  │   Template API  │  │   Import     │ │
│  │   Endpoints     │  │   Endpoints     │  │   API        │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

1. **ファイルアップロード**: ユーザーがCSVファイルをアップロード
2. **初期パース**: システムが自動検出でCSVを解析
3. **プレビュー表示**: パース結果を表形式で表示
4. **設定調整**: ユーザーがヘッダー行、データ範囲、列マッピングを調整
5. **切り出しルール設定**: ユーザーがデータ抽出ルールを選択・カスタマイズ
6. **ルールテスト**: サンプルデータでルールの動作を確認
7. **バリデーション**: 設定されたパース結果をバリデーション
8. **インポート実行**: バリデーション成功後にデータをインポート

## Components and Interfaces

### フロントエンドコンポーネント

#### 1. EnhancedCSVImporter (メインコンポーネント)
```typescript
interface EnhancedCSVImporterProps {
  onImport: (addresses: AlarmAddress[]) => void;
  onError?: (error: string) => void;
}
```

#### 2. CSVPreviewTable
```typescript
interface CSVPreviewTableProps {
  data: string[][];
  headerRow: number;
  dataRange: { start: number; end: number };
  columnMappings: ColumnMapping[];
  onHeaderRowChange: (row: number) => void;
  onDataRangeChange: (range: { start: number; end: number }) => void;
  onColumnMappingChange: (mappings: ColumnMapping[]) => void;
}
```

#### 3. ParseSettings
```typescript
interface ParseSettingsProps {
  settings: ParseConfiguration;
  onSettingsChange: (settings: ParseConfiguration) => void;
  onTemplateLoad: (template: ParseTemplate) => void;
  onTemplateSave: (name: string) => void;
}
```

#### 4. ValidationPanel
```typescript
interface ValidationPanelProps {
  validationResults: ValidationResult[];
  onValidationComplete: (isValid: boolean) => void;
}
```

#### 5. ExtractionRuleEditor
```typescript
interface ExtractionRuleEditorProps {
  rules: ExtractionRule[];
  selectedRule: ExtractionRule | null;
  sampleData: string[];
  onRuleChange: (rule: ExtractionRule) => void;
  onRuleTest: (rule: ExtractionRule, testData: string) => ExtractionTestResult;
  onRuleSave: (rule: ExtractionRule) => void;
}
```

#### 6. RulePreview
```typescript
interface RulePreviewProps {
  rule: ExtractionRule;
  sampleData: string[];
  extractionResults: ExtractionTestResult[];
}
```

### サービスインターフェース

#### CSVParserService
```typescript
interface CSVParserService {
  parseCSV(file: File, config: ParseConfiguration): Promise<ParseResult>;
  detectEncoding(file: File): Promise<string>;
  detectDelimiter(content: string): string;
  validateData(data: AlarmAddress[]): ValidationResult[];
}
```

#### TemplateService
```typescript
interface TemplateService {
  saveTemplate(template: ParseTemplate): Promise<void>;
  loadTemplates(): Promise<ParseTemplate[]>;
  deleteTemplate(id: string): Promise<void>;
}
```

## Data Models

### 基本データ型

#### ParseConfiguration
```typescript
interface ParseConfiguration {
  encoding: string;
  delimiter: string;
  quoteChar: string;
  headerRow: number;
  dataRange: {
    start: number;
    end: number;
  };
  columnMappings: ColumnMapping[];
}
```

#### ColumnMapping
```typescript
interface ColumnMapping {
  columnIndex: number;
  fieldName: string;
  dataType: 'string' | 'number' | 'boolean';
  required: boolean;
  transform?: (value: string) => any;
  extractionRule?: ExtractionRule;
}
```

#### ExtractionRule
```typescript
interface ExtractionRule {
  id: string;
  name: string;
  pattern: string; // 正規表現パターン
  extractionType: 'regex' | 'split' | 'substring';
  extractionConfig: {
    // regex用
    captureGroups?: { [key: string]: number };
    // split用
    delimiter?: string;
    targetIndex?: number;
    // substring用
    startIndex?: number;
    endIndex?: number;
  };
  outputMapping: {
    alarmNo?: string;
    addressType?: string;
    address?: string;
    addressBit?: string;
    comments?: string[];
  };
}
```

#### PredefinedExtractionRules
```typescript
interface PredefinedExtractionRules {
  oldFormat: ExtractionRule; // [1]D1000:15 形式
  newFormat: ExtractionRule; // D1000_15:1 形式
  extendedFormat: ExtractionRule; // 1,[PLC1]1000.15,1,comment 形式
  custom: ExtractionRule[]; // ユーザー定義ルール
}
```

#### ParseTemplate
```typescript
interface ParseTemplate {
  id: string;
  name: string;
  description?: string;
  configuration: ParseConfiguration;
  createdAt: Date;
  updatedAt: Date;
}
```

#### ParseResult
```typescript
interface ParseResult {
  data: string[][];
  headers: string[];
  rowCount: number;
  columnCount: number;
  encoding: string;
  delimiter: string;
}
```

#### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  row: number;
  column: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  row: number;
  column: number;
  field: string;
  message: string;
}
```

#### ExtractionTestResult
```typescript
interface ExtractionTestResult {
  success: boolean;
  extractedData: {
    alarmNo?: number;
    addressType?: string;
    address?: string;
    addressBit?: number;
    comments?: string[];
  };
  error?: string;
}
```

### 拡張されたAlarmAddress型

```typescript
interface EnhancedAlarmAddress extends AlarmAddress {
  sourceRow: number;
  validationStatus: 'valid' | 'warning' | 'error';
  validationMessages: string[];
}
```
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### プレビュー表示プロパティ

**Property 1: CSV upload triggers preview display**
*For any* valid CSV file, when uploaded, the system should display the parsed result in tabular format
**Validates: Requirements 1.1**

**Property 2: Preview table includes grid structure**
*For any* CSV preview display, the table should include both row numbers and column numbers in grid format
**Validates: Requirements 1.2**

**Property 3: Character encoding auto-detection**
*For any* CSV file containing mixed Japanese and English text, the system should auto-detect character encoding and display content correctly
**Validates: Requirements 1.3**

**Property 4: Large file preview limitation**
*For any* CSV file larger than a threshold, the system should display only the first 100 rows as preview
**Validates: Requirements 1.4**

**Property 5: Scrollable column display**
*For any* preview table, all columns should be displayed in a scrollable format
**Validates: Requirements 1.5**

### ヘッダー行設定プロパティ

**Property 6: Header row change triggers immediate update**
*For any* header row selection change, the preview table should update immediately to reflect the new header styling
**Validates: Requirements 2.2**

**Property 7: Header row styling application**
*For any* selected header row, the system should display that row with distinct header styling
**Validates: Requirements 2.3**

**Property 8: Default header row selection**
*For any* CSV with multiple potential header rows, the system should select the first non-empty row as default
**Validates: Requirements 2.5**

### データ範囲設定プロパティ

**Property 9: Range exclusion visual feedback**
*For any* data range modification, rows outside the specified range should be displayed with grayed-out styling
**Validates: Requirements 3.2**

**Property 10: Row count calculation**
*For any* data range setting, the system should display the correct count of rows within the specified range
**Validates: Requirements 3.3**

**Property 11: Invalid range validation**
*For any* invalid row range input, the system should display an error message and revert to the previous valid value
**Validates: Requirements 3.4**

**Property 12: Header-range overlap warning**
*For any* data range that overlaps with the header row, the system should display a warning message
**Validates: Requirements 3.5**

### 列マッピングプロパティ

**Property 13: Column mapping real-time reflection**
*For any* column mapping change, the system should immediately reflect the change in the preview display
**Validates: Requirements 4.2**

**Property 14: Required field mapping validation**
*For any* unmapped required field, the system should display a warning icon
**Validates: Requirements 4.3**

**Property 15: Duplicate mapping detection**
*For any* field mapped to multiple columns, the system should display an error message
**Validates: Requirements 4.4**

**Property 16: Mapping summary display**
*For any* completed mapping configuration, the system should display a summary of the settings
**Validates: Requirements 4.5**

### テンプレート管理プロパティ

**Property 17: Template save name prompt**
*For any* template save operation, the system should prompt for template name input
**Validates: Requirements 5.2**

**Property 18: Template selection availability**
*For any* new CSV upload, the system should provide saved templates as selectable options
**Validates: Requirements 5.3**

**Property 19: Template configuration restoration**
*For any* selected template, the system should automatically apply the saved configuration settings
**Validates: Requirements 5.4**

**Property 20: Post-template adjustment capability**
*For any* applied template, the system should allow users to make fine adjustments to the settings
**Validates: Requirements 5.5**

### バリデーションプロパティ

**Property 21: Parse completion triggers validation**
*For any* completed parse configuration, the system should execute data validation
**Validates: Requirements 6.1**

**Property 22: Required field empty value highlighting**
*For any* required field with empty values, the system should highlight the error rows
**Validates: Requirements 6.2**

**Property 23: Data type validation marking**
*For any* cell with incorrect data type, the system should mark the cell in red
**Validates: Requirements 6.3**

**Property 24: Duplicate alarm number detection**
*For any* duplicate alarm numbers, the system should display warning indicators for the duplicate rows
**Validates: Requirements 6.4**

**Property 25: Import button state control**
*For any* validation state change, the import button should be enabled when validation succeeds and disabled when validation errors exist
**Validates: Requirements 6.5, 7.1**

### インポート実行プロパティ

**Property 26: Import confirmation dialog**
*For any* import button click, the system should display a confirmation dialog
**Validates: Requirements 7.2**

**Property 27: Import progress indication**
*For any* import execution, the system should display progress status
**Validates: Requirements 7.3**

**Property 28: Import completion notification**
*For any* completed import, the system should display success message with processed record count
**Validates: Requirements 7.4**

**Property 29: Import error handling**
*For any* import error occurrence, the system should display error details and rollback information
**Validates: Requirements 7.5**

### CSV形式対応プロパティ

**Property 30: Delimiter auto-detection**
*For any* CSV with different delimiters (comma, semicolon, tab), the system should automatically detect the correct delimiter
**Validates: Requirements 8.1**

**Property 31: Manual delimiter fallback**
*For any* failed auto-detection, the system should provide manual delimiter selection options
**Validates: Requirements 8.2**

**Property 32: Quote character processing**
*For any* CSV with quoted fields, the system should properly process the quote characters
**Validates: Requirements 8.3**

**Property 33: Multi-line field parsing**
*For any* CSV with fields containing line breaks, the system should correctly parse multi-line fields
**Validates: Requirements 8.4**

**Property 34: Character encoding detection**
*For any* CSV with different character encodings, the system should auto-detect UTF-8, Shift-JIS, and EUC-JP
**Validates: Requirements 8.5**

### パフォーマンスプロパティ

**Property 35: Large file warning**
*For any* CSV file over 10MB, the system should display a warning message
**Validates: Requirements 9.1**

**Property 36: Chunk processing execution**
*For any* large file processing, the system should execute chunk-based processing
**Validates: Requirements 9.2**

**Property 37: Processing progress display**
*For any* time-consuming processing, the system should display a progress bar
**Validates: Requirements 9.3**

**Property 38: Virtual scrolling optimization**
*For any* heavy preview display, the system should use virtual scrolling for display performance optimization
**Validates: Requirements 9.5**

### データ切り出しルールプロパティ

**Property 39: Predefined rule application**
*For any* CSV data matching predefined format patterns (old format, new format, extended format), the appropriate extraction rule should be automatically applied
**Validates: Enhanced Requirements - Automatic Rule Detection**

**Property 40: Custom rule creation**
*For any* user-defined extraction rule with valid regex pattern, the system should allow creation and testing of the custom rule
**Validates: Enhanced Requirements - Custom Rule Creation**

**Property 41: Rule testing with sample data**
*For any* extraction rule and sample data input, the system should show preview of extracted fields (alarm number, address type, address, bit, comments)
**Validates: Enhanced Requirements - Rule Testing**

**Property 42: Rule extraction accuracy**
*For any* valid extraction rule applied to matching data format, the extracted alarm address components should match the expected structure
**Validates: Enhanced Requirements - Extraction Accuracy**

**Property 43: Rule validation feedback**
*For any* invalid extraction rule (malformed regex, missing required mappings), the system should provide specific error feedback
**Validates: Enhanced Requirements - Rule Validation**

### エラーハンドリングプロパティ

**Property 44: File read error messaging**
*For any* CSV file read failure, the system should display specific error cause information
**Validates: Requirements 10.1**

**Property 45: Network error retry option**
*For any* network error occurrence, the system should provide retry options
**Validates: Requirements 10.2**

**Property 46: Unsaved changes warning**
*For any* attempt to leave page during configuration changes, the system should warn about unsaved changes
**Validates: Requirements 10.3**

**Property 47: Timeout recovery handling**
*For any* timeout during long processing, the system should save processing state and provide resume options
**Validates: Requirements 10.4**

## Error Handling

### エラー分類

#### 1. ファイル関連エラー
- **ファイル読み込みエラー**: 破損ファイル、アクセス権限不足
- **エンコーディングエラー**: 未対応文字エンコーディング
- **ファイルサイズエラー**: 制限サイズ超過

#### 2. パース関連エラー
- **区切り文字検出エラー**: 自動検出失敗
- **データ形式エラー**: 不正なCSV構造
- **文字化けエラー**: エンコーディング不一致

#### 3. バリデーションエラー
- **必須フィールドエラー**: 必須項目の欠損
- **データ型エラー**: 期待される型との不一致
- **重複データエラー**: 一意制約違反

#### 4. システムエラー
- **メモリ不足エラー**: 大容量ファイル処理時
- **ネットワークエラー**: API通信失敗
- **タイムアウトエラー**: 処理時間超過

### エラー処理戦略

#### 段階的エラー処理
1. **予防的チェック**: ファイルアップロード時の事前検証
2. **早期検出**: パース処理中のリアルタイム検証
3. **包括的バリデーション**: インポート前の最終チェック
4. **グレースフル・デグラデーション**: 部分的失敗時の継続処理

#### ユーザーフィードバック
- **視覚的インジケーター**: エラー箇所のハイライト表示
- **詳細メッセージ**: 具体的なエラー原因と対処法
- **進行状況表示**: 長時間処理の透明性確保
- **復旧オプション**: エラー発生時の代替手段提供

## Testing Strategy

### デュアルテストアプローチ

本プロジェクトでは、ユニットテストとプロパティベーステストの両方を実装します：

#### ユニットテスト
- 特定の例やエッジケース、エラー条件の検証
- コンポーネント間の統合ポイントのテスト
- UI要素の存在確認（例：ドロップダウンの表示、ボタンの有効化）

#### プロパティベーステスト
- 全入力に対して成り立つべき普遍的プロパティの検証
- 最小100回の反復実行による包括的テスト
- 各プロパティベーステストには設計ドキュメントの対応プロパティを明記

### テストライブラリ

- **プロパティベーステスト**: fast-check (JavaScript/TypeScript用)
- **ユニットテスト**: Jest + React Testing Library
- **統合テスト**: Cypress

### テスト設定要件

- プロパティベーステストは最小100回の反復実行
- 各プロパティベーステストには以下の形式でコメントを付与：
  `**Feature: csv-parser-enhancement, Property {number}: {property_text}**`
- 各正確性プロパティは単一のプロパティベーステストで実装
- テストデータ生成には smart generators を使用して入力空間を適切に制約

### テスト対象範囲

#### フロントエンド
- CSVパーサーサービスの全機能
- プレビューテーブルコンポーネントの表示・操作
- バリデーション機能の正確性
- テンプレート管理機能

#### バックエンド
- CSV処理API エンドポイント
- データバリデーション機能
- テンプレート保存・読み込み機能
- エラーハンドリング機能

#### 統合テスト
- エンドツーエンドのCSVインポートフロー
- 異なるCSV形式での動作確認
- パフォーマンステスト（大容量ファイル処理）