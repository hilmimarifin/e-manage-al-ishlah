'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { isAdminClient } from '@/lib/client-utils'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const isAdmin = isAdminClient()
  useEffect(() => {
    if (isAuthenticated) {
      isAdmin ? router.replace('/dashboard') : router.replace('/transaction')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, router, isAdmin])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p className="text-muted-foreground">Redirecting you to the appropriate page...</p>
      </div>
    </div>
  )
}