import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return Response.redirect(new URL('/?error=invalid-token').toString())
  }

  try {
    const decoded = atob(token)
    const [email, timestamp] = decoded.split(':')
    
    // Token valid for 24 hours
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
      return Response.redirect(new URL('/?error=token-expired').toString())
    }

    // Confirm user in Supabase Auth
    const supabase = getSupabaseAdmin()
    
    // Get user by email (we need to find them first)
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users.find(u => u.email === email)
    
    if (user) {
      // Confirm email
      await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      })
    }

    // Success - redirect to login with verified email
    return Response.redirect(new URL(`/?verified=true&email=${encodeURIComponent(email)}`).toString())
  } catch (error) {
    console.error('Verify error:', error)
    return Response.redirect(new URL('/?error=invalid-token').toString())
  }
}