import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, name, verificationUrl } = await request.json()

    if (!email || !verificationUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'Oyik AI <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your Oyik Dashboard account',
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
      <h1 style="color: #1e1b4b; font-size: 24px; margin: 16px 0 8px;">Welcome to Oyik!</h1>
      <p style="color: #6b7280; font-size: 16px;">Hi ${name || 'there'},</p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Thanks for creating your Oyik Dashboard account. Click the button below to verify your email:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background: #7c3aed; color: white; font-size: 16px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Verify Email
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy this link: <br/>
      <span style="color: #7c3aed; word-break: break-all;">${verificationUrl}</span>
    </p>
    
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px;">
        Oyik AI - Real Estate Intelligence<br/>
        This email was sent to ${email}
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true, data })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}