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

    // Success - redirect to login with verified email
    return Response.redirect(new URL(`/?verified=true&email=${encodeURIComponent(email)}`).toString())
  } catch {
    return Response.redirect(new URL('/?error=invalid-token').toString())
  }
}