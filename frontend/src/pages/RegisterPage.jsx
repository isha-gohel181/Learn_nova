import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { registerUser } from '@/lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser(formData);
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#0B0F1A_0%,#1A1F3A_100%)] p-4 sm:p-8'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_55%)]' />
      <section className='relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center'>
        <Card className='w-full max-w-md border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.06)] text-[#E5E7EB] shadow-[0_0_36px_rgba(59,130,246,0.25)] backdrop-blur-xl'>
          <CardHeader className='space-y-2'>
            <CardTitle className='text-2xl text-[#E5E7EB]'>Create Account</CardTitle>
            <CardDescription className='text-[#9CA3AF]'>Register to start using your learning platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='name' className='text-[#E5E7EB]'>Name</Label>
                <Input
                  id='name'
                  name='name'
                  type='text'
                  placeholder='Your name'
                  className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] placeholder:text-[#6B7280] focus-visible:ring-[rgba(139,92,246,0.6)]'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email' className='text-[#E5E7EB]'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='you@example.com'
                  className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] placeholder:text-[#6B7280] focus-visible:ring-[rgba(139,92,246,0.6)]'
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password' className='text-[#E5E7EB]'>Password</Label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='At least 6 characters'
                  className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] placeholder:text-[#6B7280] focus-visible:ring-[rgba(139,92,246,0.6)]'
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword' className='text-[#E5E7EB]'>Re-enter Password</Label>
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  placeholder='Confirm your password'
                  className='border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] text-[#E5E7EB] placeholder:text-[#6B7280] focus-visible:ring-[rgba(139,92,246,0.6)]'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='role' className='text-[#E5E7EB]'>Account Role</Label>
                <select
                  id='role'
                  name='role'
                  value={formData.role || 'learner'}
                  onChange={handleChange}
                  className='flex h-10 w-full items-center justify-between rounded-md border border-[rgba(59,130,246,0.3)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-sm text-[#E5E7EB] ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(139,92,246,0.6)] focus-visible:ring-offset-2'
                  required
                >
                  <option value='learner' className='bg-[#1A1F3A] text-white'>Learner (Student)</option>
                  <option value='instructor' className='bg-[#1A1F3A] text-white'>Instructor (Teacher)</option>
                </select>
              </div>

              {error ? (
                <Alert variant='destructive'>
                  <AlertTitle>Registration failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type='submit'
                className='w-full border-0 bg-[linear-gradient(90deg,#3B82F6_0%,#8B5CF6_100%)] text-white shadow-[0_0_22px_rgba(59,130,246,0.4)] hover:shadow-[0_0_28px_rgba(139,92,246,0.6)]'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>

              <p className='text-center text-sm text-[#9CA3AF]'>
                Already have an account?{' '}
                <Link to='/login' className='font-medium text-[#22D3EE] underline-offset-4 hover:text-[#8B5CF6] hover:underline'>
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
