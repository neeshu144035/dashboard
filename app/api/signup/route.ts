import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, password, fullName, organizationName } = await request.json()

    if (!email || !password || !fullName || !organizationName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    
    // Create user via Admin API - Supabase won't send email
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        organization_name: organizationName,
      },
    })

    if (createError) {
      return Response.json({ error: createError.message }, { status: 400 })
    }

    // Create organization and profile via trigger (handled by DB)
    // The trigger should fire on auth.users insert
    
    // Send welcome email via Resend (optional)
    try {
      await resend.emails.send({
        from: 'Oyik AI <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Oyik Dashboard!',
        html: `<h1>Welcome ${fullName}!</h1><p>Your Oyik Dashboard account is ready.</p>`,
      })
    } catch (e) {
      console.error('Welcome email failed:', e)
    }

    return Response.json({ ok: true, userId: user.id })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    )
  }
}