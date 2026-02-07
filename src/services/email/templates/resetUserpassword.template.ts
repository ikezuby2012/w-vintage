export const resetUserPasswordEmail = (customerName: string, year: string, defaultPassword: string) => 
    `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #eeeeee;">
              <h2 style="margin:0;color:#1f2937;">Account Password Reset</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#374151;font-size:15px;">
                Hello <strong>${customerName}</strong>,
              </p>

              <p style="color:#374151;font-size:15px;line-height:1.6;">
                Your account password has been reset by an administrator.
                Please use the temporary password below to log in.
              </p>

              <div style="margin:24px 0;padding:16px;background:#f9fafb;border:1px dashed #d1d5db;border-radius:6px;text-align:center;">
                <p style="margin:0;color:#111827;font-size:18px;font-weight:bold;">
                  ${defaultPassword}
                </p>
              </div>

              <p style="color:#374151;font-size:15px;line-height:1.6;">
                For security reasons, you will be required to change this
                password immediately after logging in.
              </p>

              <p style="color:#6b7280;font-size:13px;">
                If you did not request this change, please contact support immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${year} Wealth Vintage. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;