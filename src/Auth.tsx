import React, { useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import { AuthError, User } from '@supabase/supabase-js'

const AuthContext = React.createContext<{signOut: () => Promise<{
  error: AuthError | null;
}>, user: User | null}>({signOut: async () => await supabase.auth.signOut(), user: null})

export function AuthProvider({ children } : {children: any}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    setLoading(false)

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Will be passed down to Signup, Login and Dashboard components
  const value = {
    signOut: async () => await supabase.auth.signOut(),
    user,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}