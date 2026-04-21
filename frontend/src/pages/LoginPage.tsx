import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { MESSAGE_FORMATTER } from '@/localization/utils/message-formatter';
import { getDefaultRouteForRole } from '@/utils/auth';


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, isLoading } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    const destination = user.password_change_required ? '/change-password' : getDefaultRouteForRole(user.role);
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(userId, password);
      const destination = response.user.password_change_required ? '/change-password' : getDefaultRouteForRole(response.user.role);
      navigate(destination, { replace: true });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : MESSAGE_FORMATTER.ERROR_PERMISSION();
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">RTMS ログイン</CardTitle>
          <CardDescription>ユーザーIDとパスワードを入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="user-id">ユーザーID</Label>
              <Input id="user-id" value={userId} onChange={(event) => setUserId(event.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? MESSAGE_FORMATTER.AUTHENTICATING() : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};


export default LoginPage;