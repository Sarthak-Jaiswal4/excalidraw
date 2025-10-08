'use client'
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { SpinnerDemo } from './LoadingSpinner';
import { signup } from '@/actions';

function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response:{success:boolean} = await signup(form)
      if(response){
        router.push('/dashboard');
      }else{
        setError('Signup failed');
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen flex-col bg-gray-50 relative">
      <form
        className="flex flex-col gap-4 p-8 bg-white border border-gray-200 rounded-lg shadow-md min-w-[320px] w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-center mb-2">Sign Up</h2>
        {error && (
          <div className="text-red-600 text-sm text-center mb-2">{error}</div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            name="name"
            required
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
        <div className="text-center text-sm mt-2">
          <span>Already have an account? </span>
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </div>
      </form>
        {
          loading && (
            <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2 z-50 shadow-md rounded-full">
                <SpinnerDemo title='Signing Up' />
            </div>
          )
        }
    </div>
  );
}

export default Signup