export const resetPinEmailTemplate = ({
  name,
  otp
}: {
  name: string;
  otp: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Reset PIN</title>
</head>
<body style="margin:0;font-family:Arial;background:#f4f6f8;padding:20px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="500" style="background:#ffffff;border-radius:8px;padding:24px">
          <tr>
            <td align="center" style="font-size:20px;font-weight:bold">
              Reset Your Account PIN
            </td>
          </tr>

          <tr>
            <td style="padding-top:16px;font-size:14px;color:#555">
              Hi ${name},
              <br /><br />
              Use the OTP below to reset your card PIN. This code expires in
              <strong>10 minutes</strong>.
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 0">
              <div style="
                font-size:32px;
                font-weight:bold;
                letter-spacing:6px;
                background:#f0f2f5;
                padding:16px 24px;
                border-radius:6px;
                display:inline-block">
                ${otp}
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size:13px;color:#777">
              If you did not request this, please ignore this email.
            </td>
          </tr>

          <tr>
            <td style="padding-top:24px;font-size:12px;color:#aaa" align="center">
              © ${new Date().getFullYear()} Wealth Vintage. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
