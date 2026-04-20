/**
 * メッセージフォーマット関数のテスト
 */

import {
  MESSAGE_FORMATTER,
  formatMessage,
  createEntityMessage,
  createMultipleDeleteMessage,
  createFileMessage,
  createSelectionMessage,
} from '../message-formatter';

describe('MESSAGE_FORMATTER', () => {
  describe('成功メッセージ', () => {
    it('作成成功メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.SUCCESS_CREATE('ユーザー');
      expect(result).toBe('ユーザーを作成しました');
    });

    it('更新成功メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.SUCCESS_UPDATE('デバイス');
      expect(result).toBe('デバイスを更新しました');
    });

    it('削除成功メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.SUCCESS_DELETE('グループ');
      expect(result).toBe('グループを削除しました');
    });

    it('保存成功メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.SUCCESS_SAVE();
      expect(result).toBe('正常に保存されました');
    });
  });

  describe('エラーメッセージ', () => {
    it('取得エラーメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.ERROR_FETCH('ユーザー');
      expect(result).toBe('ユーザーの取得に失敗しました');
    });

    it('作成エラーメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.ERROR_CREATE('デバイス');
      expect(result).toBe('デバイスの作成に失敗しました');
    });

    it('ネットワークエラーメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.ERROR_NETWORK();
      expect(result).toBe('接続に問題があります。しばらく待ってから再試行してください');
    });

    it('権限エラーメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.ERROR_PERMISSION();
      expect(result).toBe('この操作を実行する権限がありません');
    });

    it('不明エラーメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.ERROR_UNKNOWN();
      expect(result).toBe('予期しないエラーが発生しました');
    });
  });

  describe('確認メッセージ', () => {
    it('削除確認メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.CONFIRM_DELETE('ユーザー');
      expect(result).toBe('このユーザーを削除してもよろしいですか？この操作は取り消せません。');
    });

    it('複数削除確認メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.CONFIRM_DELETE_MULTIPLE(5, 'デバイス');
      expect(result).toBe('選択した5件のデバイスを削除してもよろしいですか？この操作は取り消せません。');
    });

    it('未保存変更確認メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.CONFIRM_UNSAVED_CHANGES();
      expect(result).toBe('保存されていない変更があります。このページを離れてもよろしいですか？');
    });

    it('上書き確認メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.CONFIRM_OVERWRITE('test.csv');
      expect(result).toBe('ファイル「test.csv」は既に存在します。上書きしてもよろしいですか？');
    });
  });

  describe('ローディングメッセージ', () => {
    it('基本ローディングメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.LOADING();
      expect(result).toBe('読み込み中...');
    });

    it('データローディングメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.LOADING_DATA('ユーザー');
      expect(result).toBe('ユーザーを読み込み中...');
    });

    it('処理中メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.PROCESSING();
      expect(result).toBe('処理中...');
    });

    it('保存中メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.SAVING();
      expect(result).toBe('保存中...');
    });

    it('削除中メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.DELETING();
      expect(result).toBe('削除中...');
    });
  });

  describe('情報メッセージ', () => {
    it('データなしメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.INFO_NO_DATA('ユーザー');
      expect(result).toBe('ユーザーがありません');
    });

    it('検索結果なしメッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.INFO_EMPTY_SEARCH();
      expect(result).toBe('検索結果がありません');
    });

    it('選択件数メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.INFO_ITEMS_SELECTED(3);
      expect(result).toBe('3件が選択されています');
    });
  });

  describe('警告メッセージ', () => {
    it('未保存変更警告メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.WARNING_UNSAVED_CHANGES();
      expect(result).toBe('保存されていない変更があります');
    });

    it('大きなファイル警告メッセージを正しくフォーマットする', () => {
      const result = MESSAGE_FORMATTER.WARNING_LARGE_FILE();
      expect(result).toBe('ファイルサイズが大きいため、処理に時間がかかる場合があります');
    });
  });
});

describe('formatMessage', () => {
  it('正常なフォーマット関数を実行する', () => {
    const formatter = (name: string) => `こんにちは、${name}さん`;
    const result = formatMessage(formatter, '田中');
    expect(result).toBe('こんにちは、田中さん');
  });

  it('エラーが発生した場合にフォールバックメッセージを返す', () => {
    const formatter = () => {
      throw new Error('テストエラー');
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = formatMessage(formatter);
    expect(result).toBe('メッセージの生成に失敗しました');
    expect(consoleSpy).toHaveBeenCalledWith('メッセージフォーマットエラー:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});

describe('createEntityMessage', () => {
  it('成功作成メッセージを生成する', () => {
    const result = createEntityMessage('success_create', 'ユーザー');
    expect(result).toBe('ユーザーを作成しました');
  });

  it('エラー取得メッセージを生成する', () => {
    const result = createEntityMessage('error_fetch', 'デバイス');
    expect(result).toBe('デバイスの取得に失敗しました');
  });

  it('削除確認メッセージを生成する', () => {
    const result = createEntityMessage('confirm_delete', 'グループ');
    expect(result).toBe('このグループを削除してもよろしいですか？この操作は取り消せません。');
  });

  it('データローディングメッセージを生成する', () => {
    const result = createEntityMessage('loading_data', 'PLC');
    expect(result).toBe('PLCを読み込み中...');
  });
});

describe('createMultipleDeleteMessage', () => {
  it('複数削除確認メッセージを生成する', () => {
    const result = createMultipleDeleteMessage(10, 'ユーザー');
    expect(result).toBe('選択した10件のユーザーを削除してもよろしいですか？この操作は取り消せません。');
  });

  it('1件の削除確認メッセージを生成する', () => {
    const result = createMultipleDeleteMessage(1, 'デバイス');
    expect(result).toBe('選択した1件のデバイスを削除してもよろしいですか？この操作は取り消せません。');
  });
});

describe('createFileMessage', () => {
  it('上書き確認メッセージを生成する', () => {
    const result = createFileMessage('confirm_overwrite', 'data.xlsx');
    expect(result).toBe('ファイル「data.xlsx」は既に存在します。上書きしてもよろしいですか？');
  });

  it('ファイル選択メッセージを生成する', () => {
    const result = createFileMessage('info_file_selected', 'report.pdf');
    expect(result).toBe('ファイル「report.pdf」が選択されました');
  });
});

describe('createSelectionMessage', () => {
  it('選択件数メッセージを生成する', () => {
    const result = createSelectionMessage(7);
    expect(result).toBe('7件が選択されています');
  });

  it('0件選択メッセージを生成する', () => {
    const result = createSelectionMessage(0);
    expect(result).toBe('0件が選択されています');
  });
});