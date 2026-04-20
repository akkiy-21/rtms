/**
 * 翻訳システム統合テスト
 * 
 * メッセージフォーマット関数と翻訳定数の統合動作を確認します。
 */

import {
  MESSAGE_FORMATTER,
  createEntityMessage,
  BUSINESS_TERMS,
  ACTION_LABELS,
} from '../index';
import { TECHNICAL_TERMS } from '../constants/technical-terms';

describe('翻訳システム統合テスト', () => {
  it('業務用語とメッセージフォーマッターを組み合わせて使用できる', () => {
    const userCreateMessage = MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER);
    expect(userCreateMessage).toBe('ユーザーを作成しました');

    const deviceDeleteMessage = MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.DEVICE);
    expect(deviceDeleteMessage).toBe('デバイスを削除しました');

    const groupUpdateMessage = MESSAGE_FORMATTER.SUCCESS_UPDATE(BUSINESS_TERMS.GROUP);
    expect(groupUpdateMessage).toBe('グループを更新しました');
  });

  it('エンティティメッセージ生成関数が業務用語と連携する', () => {
    const userFetchError = createEntityMessage('error_fetch', BUSINESS_TERMS.USERS);
    expect(userFetchError).toBe('ユーザーの取得に失敗しました');

    const deviceCreateSuccess = createEntityMessage('success_create', BUSINESS_TERMS.DEVICE);
    expect(deviceCreateSuccess).toBe('デバイスを作成しました');

    const plcDeleteConfirm = createEntityMessage('confirm_delete', TECHNICAL_TERMS.PLC);
    expect(plcDeleteConfirm).toBe('このPLCを削除してもよろしいですか？この操作は取り消せません。');
  });

  it('アクションラベルとメッセージフォーマッターを組み合わせて使用できる', () => {
    // アクションラベルは単体で使用されることが多いが、
    // メッセージ内で組み合わせることも可能
    const createAction = ACTION_LABELS.CREATE;
    const editAction = ACTION_LABELS.EDIT;
    const deleteAction = ACTION_LABELS.DELETE;

    expect(createAction).toBe('作成');
    expect(editAction).toBe('編集');
    expect(deleteAction).toBe('削除');

    // カスタムメッセージでの使用例
    const customMessage = `${BUSINESS_TERMS.USER}の${createAction}が完了しました`;
    expect(customMessage).toBe('ユーザーの作成が完了しました');
  });

  it('複数のメッセージタイプが正しく動作する', () => {
    // 成功メッセージ
    const successMessages = [
      MESSAGE_FORMATTER.SUCCESS_SAVE(),
      MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.CUSTOMER),
      MESSAGE_FORMATTER.SUCCESS_UPDATE(BUSINESS_TERMS.PRODUCT),
    ];

    expect(successMessages).toEqual([
      '正常に保存されました',
      '顧客を作成しました',
      '製品を更新しました',
    ]);

    // エラーメッセージ
    const errorMessages = [
      MESSAGE_FORMATTER.ERROR_NETWORK(),
      MESSAGE_FORMATTER.ERROR_PERMISSION(),
      MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.CLASSIFICATIONS),
    ];

    expect(errorMessages).toEqual([
      '接続に問題があります。しばらく待ってから再試行してください',
      'この操作を実行する権限がありません',
      '分類の取得に失敗しました',
    ]);

    // ローディングメッセージ
    const loadingMessages = [
      MESSAGE_FORMATTER.LOADING(),
      MESSAGE_FORMATTER.PROCESSING(),
      MESSAGE_FORMATTER.LOADING_DATA(BUSINESS_TERMS.ALARMS),
    ];

    expect(loadingMessages).toEqual([
      '読み込み中...',
      '処理中...',
      'アラームを読み込み中...',
    ]);
  });
});