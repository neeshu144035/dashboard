import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, resetUrl } = await request.json()

    if (!email || !resetUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'Oyik AI <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your Oyik Dashboard password',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f3ff; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://oyik.cloud/oyik-logo.png" alt="Oyik AI" style="width: 64px; height: 64px; border-radius: 50%;" />
      <h1 style="color: #1e1b4b; font-size: 24px; margin: 16px 0 8px;">Reset Password</h1>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Click the button below to reset your password:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: white; font-size: 16px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If you didn't request this, please ignore this email.
    </p>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}