import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../loading-spinner';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';

describe('LoadingSpinner', () => {
  it('デフォルトの日本語ローディングメッセージを表示する', () => {
    render(<LoadingSpinner />);
    
    // デフォルトの日本語メッセージが表示されることを確認
    expect(screen.getByText(MESSAGE_FORMATTER.LOADING())).toBeInTheDocument();
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('カスタムテキストが指定された場合はそれを表示する', () => {
    const customText = MESSAGE_FORMATTER.SAVING();
    render(<LoadingSpinner text={customText} />);
    
    // カスタムテキストが表示されることを確認
    expect(screen.getByText(customText)).toBeInTheDocument();
    expect(screen.getByText('保存中...')).toBeInTheDocument();
  });

  it('スピナーアイコンが表示される', () => {
    render(<LoadingSpinner />);
    
    // data-testidでスピナーコンテナが存在することを確認
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('異なるサイズが適用される', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    const customClassName = 'custom-loading-class';
    render(<LoadingSpinner className={customClassName} />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass(customClassName);
  });

  it('空文字列のテキストが指定された場合はデフォルトメッセージを表示する', () => {
    render(<LoadingSpinner text="" />);
    
    // 空文字列の場合はデフォルトメッセージが表示されることを確認
    expect(screen.getByText(MESSAGE_FORMATTER.LOADING())).toBeInTheDocument();
  });
});