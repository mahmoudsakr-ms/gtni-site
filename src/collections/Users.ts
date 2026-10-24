import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'System',
    description: 'Manage admin users',
  },
  auth: {
    // Explicit for auditability — these match Payload's own defaults, just declared in code.
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
    // SEC-M1: Payload's default admin cookie has no `Secure` flag, so it could be
    // sent over plain HTTP. `secure` is gated on NODE_ENV so local dev (http://localhost)
    // keeps working without TLS; production (behind the Nginx/VPS HTTPS setup per
    // STACK.md/README_DEPLOY.md) gets Secure enforced.
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    forgotPassword: {
      generateEmailSubject: () => 'GTNI Admin - Reset Your Password',
      generateEmailHTML: (args) => {
        const { token } = args || {}
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://gtni.edu.eg'
        const resetUrl = `${serverUrl}/admin/reset/${token}`
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #00bcd4; margin: 0;">GTNI Admin Panel</h2>
              <p style="color: #666666; font-size: 14px;">Gouna Technical Nursing Institute</p>
            </div>
            <h3 style="color: #333333; margin-bottom: 16px;">Password Reset Request</h3>
            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
              You requested to reset your password for the GTNI Admin Panel. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #00bcd4; color: #ffffff; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #777777;">
              Or copy and paste this link in your browser:
            </p>
            <p style="font-size: 13px; color: #00bcd4; word-break: break-all;">${resetUrl}</p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #999999; text-align: center;">
              If you did not request a password reset, please ignore this email.
            </p>
          </div>
        `
      },
    },
  },
  fields: [
    // Email added by default
  ],
}
