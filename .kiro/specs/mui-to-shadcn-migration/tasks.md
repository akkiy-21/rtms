# Implementation Plan

## Phase 1: 基盤セットアップ

- [x] 1. Tailwind CSSとshadcn/uiの初期セットアップ





  - Tailwind CSSをインストール（`npm install -D tailwindcss postcss autoprefixer`）
  - Tailwind設定ファイルを生成（`npx tailwindcss init -p`）
  - tailwind.config.jsを設定（デザインドキュメントの設定を使用）
  - src/styles/globals.cssを作成し、Tailwindディレクティブを追加
  - index.cssをglobals.cssに置き換え
  - _Requirements: 1.1, 1.4_

- [x] 2. shadcn/uiの初期化





  - shadcn/ui CLIをインストール（`npx shadcn-ui@latest init`）
  - components.jsonを設定（デザインドキュメントの設定を使用）
  - TypeScript設定を更新（パスエイリアス @/* を追加）
  - lib/utils.tsを作成（cn関数を実装）
  - _Requirements: 1.2, 1.3_

- [x] 3. 基本shadcn/uiコンポーネントのインストール





  - Button コンポーネントを追加（`npx shadcn-ui@latest add button`）
  - Input コンポーネントを追加（`npx shadcn-ui@latest add input`）
  - Card コンポーネントを追加（`npx shadcn-ui@latest add card`）
  - Table コンポーネントを追加（`npx shadcn-ui@latest add table`）
  - Dialog コンポーネントを追加（`npx shadcn-ui@latest add dialog`）
  - Select コンポーネントを追加（`npx shadcn-ui@latest add select`）
  - Form コンポーネントを追加（`npx shadcn-ui@latest add form`）
  - Alert コンポーネントを追加（`npx shadcn-ui@latest add alert`）
  - Badge コンポーネントを追加（`npx shadcn-ui@latest add badge`）
  - Sheet コンポーネントを追加（`npx shadcn-ui@latest add sheet`）
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 4. 必要な依存関係のインストール





  - react-hook-formをインストール（`npm install react-hook-form`）
  - zodをインストール（`npm install zod`）
  - @hookform/resolversをインストール（`npm install @hookform/resolvers`）
  - @tanstack/react-tableをインストール（`npm install @tanstack/react-table`）
  - lucide-reactをインストール（アイコン用、`npm install lucide-react`）
  - _Requirements: 2.7_


- [x] 5. 既存アプリケーションの動作確認





  - アプリケーションをビルド（`npm run build`）
  - 開発サーバーを起動（`npm start`）
  - すべてのページが正常に表示されることを確認
  - MUIコンポーネントが正常に動作することを確認
  - _Requirements: 1.5_

## Phase 2: 共通コンポーネントの実装

- [x] 6. レイアウトコンポーネントの実装




- [x] 6.1 PageHeaderコンポーネントを実装


  - src/components/layout/page-header.tsxを作成
  - title、description、actions、breadcrumbsプロパティを実装
  - デザインドキュメントのスタイルを適用
  - _Requirements: 13.1_

- [x] 6.2 Breadcrumbコンポーネントを実装


  - src/components/layout/breadcrumb.tsxを作成
  - パンくずリストのナビゲーション機能を実装
  - _Requirements: 13.1_

- [x] 6.3 Sidebarコンポーネントを実装


  - src/components/layout/sidebar.tsxを作成
  - ナビゲーションメニューを実装
  - 既存のLayoutコンポーネントのメニュー項目を移行
  - _Requirements: 13.1_

- [x] 6.4 AppLayoutコンポーネントを実装


  - src/components/layout/app-layout.tsxを作成
  - ヘッダー、サイドバー、メインコンテンツエリアを統合
  - 戻るボタン機能を実装
  - Sheet（サイドバー）の開閉機能を実装
  - _Requirements: 13.1_


- [x] 7. 共通UIコンポーネントの実装





- [x] 7.1 DataTableコンポーネントを実装


  - src/components/common/data-table.tsxを作成
  - @tanstack/react-tableを使用してテーブル機能を実装
  - ソート、フィルタリング、ページネーション機能を実装
  - 検索機能を実装
  - _Requirements: 13.4_

- [x] 7.2 DataTableColumnHeaderコンポーネントを実装


  - src/components/common/data-table-column-header.tsxを作成
  - ソート可能なカラムヘッダーを実装
  - _Requirements: 13.4_

- [x] 7.3 DataTablePaginationコンポーネントを実装


  - src/components/common/data-table-pagination.tsxを作成
  - ページネーションコントロールを実装
  - _Requirements: 13.4_

- [x] 7.4 FormWrapperコンポーネントを実装


  - src/components/common/form-wrapper.tsxを作成
  - 統一されたフォームレイアウトを実装
  - Submit/Cancelボタンを実装
  - ローディング状態を実装
  - _Requirements: 13.4_

- [x] 7.5 ActionButtonsコンポーネントを実装


  - src/components/common/action-buttons.tsxを作成
  - Edit、Delete、Viewボタンを実装
  - カスタムアクションのサポートを実装
  - lucide-reactアイコンを使用
  - _Requirements: 13.4_

- [x] 7.6 ErrorMessageコンポーネントを実装


  - src/components/common/error-message.tsxを作成
  - 統一されたエラー表示を実装
  - Retryボタンのサポートを実装
  - _Requirements: 13.4_

- [x] 7.7 LoadingSpinnerコンポーネントを実装


  - src/components/common/loading-spinner.tsxを作成
  - ローディング表示を実装
  - _Requirements: 13.4_

- [x] 7.8 ConfirmationDialogコンポーネントを実装


  - src/components/common/confirmation-dialog.tsxを作成
  - 削除確認などの確認ダイアログを実装
  - _Requirements: 13.4_


- [x] 8. カスタムフックの実装





- [x] 8.1 useToastフックを実装


  - src/hooks/use-toast.tsを作成
  - トースト通知機能を実装
  - _Requirements: 13.4_

- [x] 8.2 useApiErrorフックを実装


  - src/hooks/use-api-error.tsを作成
  - API エラーハンドリングを実装
  - useToastと統合
  - _Requirements: 13.4_

- [ ]* 8.3 共通コンポーネントのStorybookストーリーを作成
  - 各共通コンポーネントのストーリーを作成
  - 各種状態のバリエーションを作成
  - _Requirements: 13.4_

## Phase 3: Users関連ページの移行（移行パターン確立）

- [x] 9. UsersPageの移行




- [x] 9.1 userColumnsを定義


  - src/components/features/users/user-columns.tsxを作成
  - ColumnDefを使用してカラムを定義
  - ActionButtonsを統合
  - _Requirements: 3.1, 3.2_

- [x] 9.2 UsersPageを書き換え


  - PageHeaderコンポーネントを使用
  - DataTableコンポーネントを使用
  - userColumnsを使用
  - 既存のAPI統合を維持
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9.3 UserListコンポーネントを削除


  - 不要になったUserListコンポーネントを削除
  - _Requirements: 3.2_


- [x] 10. UserCreatePageとUserEditPageの移行




- [x] 10.1 userFormSchemaを定義


  - src/components/features/users/user-form-schema.tsを作成
  - zodを使用してバリデーションスキーマを定義
  - 既存のバリデーションルールを移行
  - _Requirements: 4.2, 4.3_

- [x] 10.2 UserFormコンポーネントを書き換え


  - react-hook-formを使用
  - shadcn/ui Formコンポーネントを使用
  - userFormSchemaを統合
  - 条件付きパスワードフィールドを実装
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10.3 UserCreatePageを書き換え


  - FormWrapperコンポーネントを使用
  - 新しいUserFormを統合
  - 既存のナビゲーション動作を維持
  - _Requirements: 4.1, 4.5_

- [x] 10.4 UserEditPageを書き換え


  - FormWrapperコンポーネントを使用
  - 新しいUserFormを統合
  - 既存データの読み込みを維持
  - _Requirements: 4.1, 4.5_

- [ ]* 10.5 Users関連ページのテストを作成
  - UsersPage、UserCreatePage、UserEditPageのテストを作成
  - フォームバリデーションのテストを作成
  - _Requirements: 4.2, 4.3_

- [x] 11. Checkpoint - Users関連の動作確認





  - すべてのUsers関連ページが正常に動作することを確認
  - フォームバリデーションが正しく動作することを確認
  - API統合が維持されていることを確認


## Phase 4: Groups関連ページの移行

- [x] 12. GroupsPageの移行





- [x] 12.1 groupColumnsを定義


  - src/components/features/groups/group-columns.tsxを作成
  - _Requirements: 5.1_

- [x] 12.2 GroupsPageを書き換え


  - PageHeaderとDataTableを使用
  - _Requirements: 5.1_

- [x] 12.3 GroupListコンポーネントを削除


  - _Requirements: 5.1_

- [x] 13. GroupCreatePageとGroupEditPageの移行




- [x] 13.1 groupFormSchemaを定義


  - src/components/features/groups/group-form-schema.tsを作成
  - _Requirements: 5.4_

- [x] 13.2 GroupFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 5.4_

- [x] 13.3 GroupCreatePageとGroupEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 5.4_

- [x] 14. GroupUsersPageの移行




- [x] 14.1 GroupUsersPageを書き換え


  - ユーザーとグループの関連付けUIをshadcn/uiで実装
  - 既存の機能を維持
  - _Requirements: 5.2, 5.3_

- [x] 15. Checkpoint - Groups関連の動作確認





  - すべてのGroups関連ページが正常に動作することを確認


## Phase 5: PLC関連ページの移行

- [x] 16. PLCsPageの移行




- [x] 16.1 plcColumnsを定義


  - src/components/features/plcs/plc-columns.tsxを作成
  - _Requirements: 6.1_

- [x] 16.2 PLCsPageを書き換え


  - PageHeaderとDataTableを使用
  - _Requirements: 6.1_

- [x] 16.3 PLCListコンポーネントを削除


  - _Requirements: 6.1_

- [x] 17. PLCCreatePageとPLCEditPageの移行




- [x] 17.1 plcFormSchemaを定義


  - src/components/features/plcs/plc-form-schema.tsを作成
  - _Requirements: 6.2, 6.4_

- [x] 17.2 PLCFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - Selectコンポーネントでメーカーとプロトコルを選択
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 17.3 PLCCreatePageとPLCEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 6.2, 6.4_

- [x] 18. Checkpoint - PLC関連の動作確認






  - すべてのPLC関連ページが正常に動作することを確認

## Phase 6: Device関連ページの移行

- [x] 19. DevicesPageの移行



- [x] 19.1 deviceColumnsを定義


  - src/components/features/devices/device-columns.tsxを作成
  - _Requirements: 7.1_

- [x] 19.2 DevicesPageを書き換え


  - PageHeaderとDataTableを使用
  - _Requirements: 7.1_

- [x] 19.3 DeviceListコンポーネントを削除


  - _Requirements: 7.1_


- [x] 20. DeviceCreatePageとDeviceEditPageの移行




- [x] 20.1 deviceFormSchemaを定義


  - src/components/features/devices/device-form-schema.tsを作成
  - _Requirements: 7.2_

- [x] 20.2 DeviceFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 7.2_

- [x] 20.3 DeviceCreatePageとDeviceEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 7.2_

- [x] 21. DeviceDetailSettingsPageの移行




- [x] 21.1 DeviceDetailSettingsPageを書き換え


  - shadcn/uiコンポーネントを使用して詳細設定UIを実装
  - _Requirements: 7.3_

- [x] 22. DeviceProductSettingsPageの移行




- [x] 22.1 DeviceProductSettingsPageを書き換え


  - shadcn/uiコンポーネントを使用して製品関連付けUIを実装
  - _Requirements: 7.4_

- [x] 23. ClientSettingsPageの移行




- [x] 23.1 ClientSettingsPageを書き換え


  - shadcn/uiコンポーネントを使用してクライアント設定UIを実装
  - _Requirements: 7.5_

- [x] 23.2 ClientCreatePageとClientEditPageを書き換え


  - FormWrapperとshadcn/ui Formを使用
  - _Requirements: 7.5_

- [x] 24. Checkpoint - Device関連の動作確認





  - すべてのDevice関連ページが正常に動作することを確認


## Phase 7: Classification関連ページの移行

- [x] 25. ClassificationsPageの移行




- [x] 25.1 classificationColumnsを定義


  - src/components/features/classifications/classification-columns.tsxを作成
  - _Requirements: 8.1_

- [x] 25.2 ClassificationsPageを書き換え


  - PageHeaderとDataTableを使用
  - 階層構造の表示を実装
  - _Requirements: 8.1, 8.3_

- [x] 25.3 ClassificationListコンポーネントを削除


  - _Requirements: 8.1_

- [x] 26. ClassificationCreatePageとClassificationEditPageの移行





- [x] 26.1 classificationFormSchemaを定義

  - src/components/features/classifications/classification-form-schema.tsを作成
  - _Requirements: 8.2_

- [x] 26.2 ClassificationFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 8.2_

- [x] 26.3 ClassificationCreatePageとClassificationEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 8.2_

- [x] 27. Checkpoint - Classification関連の動作確認





  - すべてのClassification関連ページが正常に動作することを確認

## Phase 8: Customer/Product関連ページの移行

- [x] 28. CustomersPageとProductsPageの移行





- [x] 28.1 customerColumnsとproductColumnsを定義


  - src/components/features/customers/customer-columns.tsxを作成
  - src/components/features/products/product-columns.tsxを作成
  - _Requirements: 9.1_

- [x] 28.2 CustomersPageとProductsPageを書き換え


  - PageHeaderとDataTableを使用
  - _Requirements: 9.1_

- [x] 28.3 CustomerListとProductListコンポーネントを削除


  - _Requirements: 9.1_


- [x] 29. Customer/Product作成・編集ページの移行




- [x] 29.1 customerFormSchemaとproductFormSchemaを定義


  - src/components/features/customers/customer-form-schema.tsを作成
  - src/components/features/products/product-form-schema.tsを作成
  - _Requirements: 9.2_


- [x] 29.2 CustomerFormとProductFormコンポーネントを書き換え

  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 9.2_

- [x] 29.3 各作成・編集ページを書き換え


  - FormWrapperを使用
  - 顧客と製品の関連表示を実装
  - _Requirements: 9.2, 9.3_

- [x] 30. Checkpoint - Customer/Product関連の動作確認





  - すべてのCustomer/Product関連ページが正常に動作することを確認

## Phase 9: Alarm関連ページの移行

- [x] 31. AlarmGroupsPageの移行




- [x] 31.1 alarmGroupColumnsを定義


  - src/components/features/alarms/alarm-group-columns.tsxを作成
  - _Requirements: 10.1_

- [x] 31.2 AlarmGroupsPageを書き換え


  - PageHeaderとDataTableを使用
  - _Requirements: 10.1_

- [x] 31.3 AlarmGroupListコンポーネントを削除


  - _Requirements: 10.1_

- [x] 32. AlarmGroupCreatePageとAlarmGroupEditPageの移行




- [x] 32.1 alarmGroupFormSchemaを定義


  - src/components/features/alarms/alarm-group-form-schema.tsを作成
  - _Requirements: 10.3_

- [x] 32.2 AlarmGroupFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 10.3_

- [x] 32.3 AlarmGroupCreatePageとAlarmGroupEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 10.3_


- [x] 33. AlarmAddressesPageの移行




- [x] 33.1 AlarmAddressesPageを書き換え


  - shadcn/uiコンポーネントを使用
  - ネストされたアラームコメントの表示を実装
  - _Requirements: 10.2, 10.4_

- [x] 34. Checkpoint - Alarm関連の動作確認





  - すべてのAlarm関連ページが正常に動作することを確認

## Phase 10: Logging関連ページの移行

- [x] 35. LoggingSettingsPageの移行




- [x] 35.1 loggingSettingColumnsを定義


  - src/components/features/logging/logging-setting-columns.tsxを作成
  - _Requirements: 11.1_

- [x] 35.2 LoggingSettingsPageを書き換え


  - PageHeaderとDataTableを使用
  - _Requirements: 11.1_

- [x] 35.3 LoggingSettingListコンポーネントを削除


  - _Requirements: 11.1_

- [x] 36. LoggingSettingCreatePageとLoggingSettingEditPageの移行





- [x] 36.1 loggingSettingFormSchemaを定義


  - src/components/features/logging/logging-setting-form-schema.tsを作成
  - _Requirements: 11.3_

- [x] 36.2 LoggingSettingFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 11.3_

- [x] 36.3 LoggingSettingCreatePageとLoggingSettingEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 11.3_


- [x] 37. LoggingDataSettingsPageの移行





- [x] 37.1 loggingDataSettingColumnsを定義


  - src/components/features/logging/logging-data-setting-columns.tsxを作成
  - _Requirements: 11.2_

- [x] 37.2 LoggingDataSettingsPageを書き換え


  - PageHeaderとDataTableを使用
  - 親子関係の表示を実装
  - _Requirements: 11.2, 11.4_

- [x] 37.3 LoggingDataSettingListコンポーネントを削除


  - _Requirements: 11.2_

- [x] 38. LoggingDataSetting作成・編集ページの移行





- [x] 38.1 loggingDataSettingFormSchemaを定義


  - src/components/features/logging/logging-data-setting-form-schema.tsを作成
  - _Requirements: 11.3_

- [x] 38.2 LoggingDataSettingFormコンポーネントを書き換え


  - react-hook-formとshadcn/ui Formを使用
  - _Requirements: 11.3_

- [x] 38.3 LoggingDataSettingCreatePageとLoggingDataSettingEditPageを書き換え


  - FormWrapperを使用
  - _Requirements: 11.3_

- [x] 39. Checkpoint - Logging関連の動作確認




  - すべてのLogging関連ページが正常に動作することを確認

## Phase 11: その他の設定ページの移行

- [x] 40. EfficiencySettingsPageの移行




- [x] 40.1 EfficiencySettingsPageを書き換え


  - shadcn/uiコンポーネントを使用
  - _Requirements: 12.1_

- [x] 41. IOSettingsPageの移行






- [x] 41.1 IOSettingsPageを書き換え





  - shadcn/uiコンポーネントを使用
  - _Requirements: 12.2_


- [x] 42. QualityControlSignalsPageの移行





- [x] 42.1 QualityControlSignalsPageを書き換え


  - shadcn/uiコンポーネントを使用
  - _Requirements: 12.3_

- [x] 43. TimeTablePageの移行




- [x] 43.1 TimeTablePageを書き換え


  - shadcn/uiコンポーネントを使用
  - _Requirements: 12.4_

- [x] 44. DataDownloadPageの移行




- [x] 44.1 DataDownloadPageを書き換え


  - shadcn/uiコンポーネントを使用
  - _Requirements: 12.5_

- [x] 45. Checkpoint - その他の設定ページの動作確認





  - すべての設定ページが正常に動作することを確認

## Phase 12: 共通コンポーネントの最終移行とクリーンアップ

- [x] 46. CSVImporterコンポーネントの移行



- [x] 46.1 CSVImporterコンポーネントを書き換え


  - shadcn/uiコンポーネントを使用してファイルアップロードUIを実装
  - _Requirements: 13.2_

- [-] 47. ResultDialogコンポーネントの移行


- [x] 47.1 ResultDialogコンポーネントを書き換え



  - shadcn/ui Dialogコンポーネントを使用
  - _Requirements: 13.3_

- [x] 48. Layoutコンポーネントの置き換え





- [x] 48.1 App.tsxを更新


  - 既存のLayoutをAppLayoutに置き換え
  - _Requirements: 13.1_

- [x] 48.2 既存のLayout.tsxを削除


  - _Requirements: 13.1_


- [x] 49. MUI依存関係の削除





- [x] 49.1 すべてのMUI importを確認


  - コードベース全体でMUIへの参照がないことを確認
  - `grep -r "@mui" src/` を実行して確認
  - _Requirements: 14.1_

- [x] 49.2 package.jsonからMUI依存関係を削除


  - @mui/material、@mui/icons-material、@mui/x-data-grid、@mui/x-date-pickersを削除
  - @emotion/react、@emotion/styledを削除
  - `npm uninstall @mui/material @mui/icons-material @mui/x-data-grid @mui/x-date-pickers @emotion/react @emotion/styled`
  - _Requirements: 14.2_

- [x] 49.3 ビルドの確認


  - `npm run build` を実行してビルドエラーがないことを確認
  - _Requirements: 14.2, 14.3_

- [x] 49.4 バンドルサイズの確認


  - ビルド後のバンドルサイズを確認
  - MUIライブラリが含まれていないことを確認
  - _Requirements: 14.3_

- [x] 50. 最終動作確認





- [x] 50.1 すべてのページの動作確認


  - 各ページが正常にレンダリングされることを確認
  - すべての機能が正常に動作することを確認
  - _Requirements: 14.4_

- [x] 50.2 統一性の確認


  - すべてのページで一貫したデザインが適用されていることを確認
  - 共通コンポーネントが正しく使用されていることを確認
  - _Requirements: 13.4_

- [ ]* 50.3 Playwright MCPを使用したE2Eテストの実行


  - Playwright MCPを使用して主要なページをテスト
  - ユーザー作成フロー、デバイス設定フロー、データダウンロードフローをテスト
  - 各ページのスクリーンショットを取得して視覚的に確認
  - テーブル操作（ソート、フィルタリング）が正しく動作することを確認
  - _Requirements: 14.4_

- [ ]* 50.4 ビジュアルリグレッションテストの実行
  - Storybookでビジュアルリグレッションテストを実行
  - _Requirements: 13.4_


## Phase 13: ドキュメント作成

- [x] 51. コンポーネント使用ガイドの作成




- [x] 51.1 COMPONENT_GUIDE.mdを作成


  - shadcn/uiコンポーネントの使用方法を説明
  - 共通コンポーネントの使用例を記載
  - _Requirements: 15.1_

- [x] 52. 移行パターンドキュメントの作成




- [x] 52.1 MIGRATION_PATTERNS.mdを作成


  - MUIからshadcn/uiへのコンポーネントマッピングを記載
  - 移行時のベストプラクティスを記載
  - _Requirements: 15.2_

- [x] 53. スタイリングガイドの作成




- [x] 53.1 STYLING_GUIDE.mdを作成


  - Tailwind CSSの使用方法を説明
  - shadcn/uiのカスタマイズ方法を説明
  - デザインシステムの詳細を記載
  - _Requirements: 15.3_

- [x] 54. トラブルシューティングガイドの作成




- [x] 54.1 TROUBLESHOOTING.mdを作成


  - 一般的な問題と解決策を記載
  - よくある質問（FAQ）を記載
  - _Requirements: 15.4_

- [x] 55. README.mdの更新




- [x] 55.1 README.mdを更新


  - 新しい技術スタック（Tailwind CSS、shadcn/ui）を記載
  - セットアップ手順を更新
  - ドキュメントへのリンクを追加
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

## 完了

すべてのタスクが完了したら、MUIからshadcn/uiへの移行は完了です。統一されたデザインシステムを持つ、モダンで保守性の高いフロントエンドアプリケーションが完成します。
