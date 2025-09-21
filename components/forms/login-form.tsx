'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login.mutateAsync({ email, password })
      // Check if there's a stored redirect path
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath && redirectPath !== '/login') {
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">DTA AL-ISHLAH</CardTitle>
        <CardDescription className="text-center">
          Masuk ke akun Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {login.error && (
            <Alert variant="destructive">
              <AlertDescription>
                {login.error.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={login.isPending}
          >
            {login.isPending ? 'Masuk...' : 'Masuk'}
          </Button>
          
          <div className="text-center text-sm">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}