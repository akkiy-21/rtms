# 翻訳システム使用例集

このドキュメントでは、RTMSフロントエンドアプリケーションの翻訳システムの具体的な使用例を示します。

## 目次

1. [基本的な使用例](#基本的な使用例)
2. [ページコンポーネントの実装例](#ページコンポーネントの実装例)
3. [フォームコンポーネントの実装例](#フォームコンポーネントの実装例)
4. [テーブルコンポーネントの実装例](#テーブルコンポーネントの実装例)
5. [エラーハンドリングの実装例](#エラーハンドリングの実装例)
6. [ダイアログ・モーダルの実装例](#ダイアログモーダルの実装例)
7. [ナビゲーションの実装例](#ナビゲーションの実装例)
8. [カスタムフックの実装例](#カスタムフックの実装例)

## 基本的な使用例

### 翻訳定数のインポートと使用

```typescript
// 基本的なインポート
import { 
  BUSINESS_TERMS, 
  ACTION_LABELS, 
  TECHNICAL_TERMS,
  STATUS_LABELS,
  MESSAGE_FORMATTER,
  DATE_FORMATTER,
  VALIDATION_MESSAGES
} from '@/localization';

// 使用例
const MyComponent = () => {
  return (
    <div>
      <h1>{BUSINESS_TERMS.USERS}</h1>
      <Button>{ACTION_LABELS.CREATE_NEW}</Button>
      <Label>{TECHNICAL_TERMS.IP_ADDRESS}</Label>
      <Badge>{STATUS_LABELS.ONLINE}</Badge>
    </div>
  );
};
```

### 動的メッセージの生成

```typescript
import { MESSAGE_FORMATTER, BUSINESS_TERMS } from '@/localization';

const handleUserCreation = async (userData: any) => {
  try {
    await createUser(userData);
    
    // 成功メッセージ
    toast.success(MESSAGE_FORMATTER.SUCCESS_CREATE(BUSINESS_TERMS.USER));
    
  } catch (error) {
    // エラーメッセージ
    toast.error(MESSAGE_FORMATTER.ERROR_CREATE(BUSINESS_TERMS.USER));
  }
};
```

## ページコンポーネントの実装例

### ユーザー管理ページ

```typescript
import React, { useState, useEffect } from 'react';
import { 
  BUSINESS_TERMS, 
  ACTION_LABELS, 
  MESSAGE_FORMATTER,
  USER_LABELS 
} from '@/localization';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error(MESSAGE_FORMATTER.ERROR_FETCH(BUSINESS_TERMS.USERS));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmMessage = MESSAGE_FORMATTER.CONFIRM_DELETE(
      `${BUSINESS_TERMS.USER}「${userName}」`
    );
    
    if (!confirm(confirmMessage)) return;

    try {
      await api.deleteUser(userId);
      toast.success(MESSAGE_FORMATTER.SUCCESS_DELETE(BUSINESS_TERMS.USER));
      fetchUsers(); // リフレッシュ
    } catch (error) {
      toast.error(MESSAGE_FORMATTER.ERROR_DELETE(BUSINESS_TERMS.USER));
    }
  };

  const columns = [
    {
      accessorKey: 'id',
      header: USER_LABELS.EMPLOYEE_ID,
    },
    {
      accessorKey: 'name',
      header: USER_LABELS.NAME,
    },
    {
      accessorKey: 'role',
      header: USER_LABELS.ROLE,
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return getRoleLabel(role);
      },
    },
    {
      id: 'actions',
      header: ACTION_LABELS.ACTIONS,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/users/${row.original.id}/edit`)}
          >
            {ACTION_LABELS.EDIT}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteUser(