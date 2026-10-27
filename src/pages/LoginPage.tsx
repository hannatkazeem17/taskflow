import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import { apiRequest, ApiRequestError } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { User, AuthTokens } from '../api/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    try {
      const tokens = await apiRequest<AuthTokens>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      const user = await apiRequest<User>('/users/me', { method: 'GET' });
      login(user, tokens);
      navigate('/');
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Login failed';
      setError('root', { message });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-500">Log in to manage your academic tasks.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}