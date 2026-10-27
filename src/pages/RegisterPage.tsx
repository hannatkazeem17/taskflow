import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import { apiRequest, ApiRequestError } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      navigate('/login');
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Registration failed';
      setError('root', { message });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Create an account</h1>
        <p className="mb-6 text-sm text-slate-500">Start tracking your academic work.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Full name" {...register('full_name')} error={errors.full_name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />

          {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}