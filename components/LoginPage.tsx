'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface LoginPageProps {
  onLogin: (user: User) => void | Promise<void>
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isForgotPassword) {
      // Send password reset via Resend
      try {
        const resetUrl = `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`
        
        const res = await fetch('/api/send-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            resetUrl,
          }),
        })
        
        if (!res.ok) {
          throw new Error('Failed to send reset email')
        }
        
        setMessage('Check your email for password reset link!')
      } catch (e) {
        setError('Failed to send reset email. Try again.')
      }
      setLoading(false)
      return
    }

    if (isSignUp) {
      if (!fullName.trim() || !organizationName.trim()) {
        setError('Full name and organization name are required')
        setLoading(false)
        return
      }

      // Create user - we'll send verification via Resend instead
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            organization_name: organizationName.trim(),
            email_verified: false,
          },
          emailRedirectTo: '',
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Send verification email via Resend
      try {
        const verificationToken = btoa(`${email}:${Date.now()}`)
        const verificationUrl = `${window.location.origin}/verify?token=${verificationToken}`
        
        await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: fullName.trim(),
            verificationUrl,
          }),
        })
      } catch (e) {
        console.error('Failed to send verification email:', e)
      }

      setMessage('Account created! Check your email to verify, then sign in.')
      setIsSignUp(false)
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
    } else if (data.user) {
      await onLogin(data.user)
    }

    setLoading(false)
  }

  const handleBack = () => {
    setIsForgotPassword(false)
    setIsSignUp(false)
    setError('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-oyik-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-oyik-border shadow-[0_2px_8px_rgba(124,58,237,0.05)] p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-oyik-lavender overflow-hidden flex items-center justify-center p-2 mb-4">
              <Image src="/oyik-logo.png" alt="Oyik AI" width={56} height={56} className="object-cover rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-oyik-navy">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-oyik-muted mt-1">
              {isForgotPassword
                ? 'Enter your email to reset password'
                : isSignUp
                  ? 'Create your organization dashboard account'
                  : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-oyik-text mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Anirudh Chaudhari"
                    className="w-full px-4 py-3 rounded-xl border border-oyik-border focus:border-oyik-purple focus:outline-none text-oyik-text"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-oyik-text mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Oyik Dashboard"
                    className="w-full px-4 py-3 rounded-xl border border-oyik-border focus:border-oyik-purple focus:outline-none text-oyik-text"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-oyik-text mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oyik.ai"
                className="w-full px-4 py-3 rounded-xl border border-oyik-border focus:border-oyik-purple focus:outline-none text-oyik-text"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-oyik-text mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-xl border border-oyik-border focus:border-oyik-purple focus:outline-none text-oyik-text pr-12"
                    required={!isForgotPassword}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-oyik-muted hover:text-oyik-text"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-oyik-purple text-white rounded-xl font-semibold hover:bg-oyik-purple2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isForgotPassword ? (
                'Send Reset Link'
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {!isForgotPassword && (
            <p className="text-center text-sm text-oyik-muted mt-4">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-oyik-purple hover:underline"
              >
                Forgot Password?
              </button>
            </p>
          )}

          <p className="text-center text-sm text-oyik-muted mt-6">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={handleBack}
                className="text-oyik-purple font-semibold hover:underline flex items-center justify-center gap-1 w-full"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            ) : (
              <>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setMessage('')
                  }}
                  className="text-oyik-purple font-semibold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
