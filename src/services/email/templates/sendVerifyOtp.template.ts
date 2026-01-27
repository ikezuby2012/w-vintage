export const sendVerifyOtp = (firstName: string, otp: string, year: string): string => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Account</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f6f8; padding: 20px 0"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background-color: #0a344f;
                  padding: 20px;
                  text-align: center;
                "
              >
                <h1 style="color: #ffffff; margin: 0; font-size: 22px">
                  NeoBank
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px">
                <p style="font-size: 15px; color: #333333; margin: 0 0 12px">
                  Hello <strong>${firstName}</strong>,
                </p>

                <p style="font-size: 14px; color: #555555; margin: 0 0 20px">
                  Welcome to <strong>NeoBank</strong> 👋 To complete your
                  registration, please use the One-Time Password (OTP) below to
                  verify your account.
                </p>

                <!-- OTP Box -->
                <div style="text-align: center; margin: 30px 0">
                  <p
                    style="font-size: 13px; color: #666666; margin-bottom: 8px"
                  >
                    Your verification code
                  </p>
                  <div
                    style="
                      display: inline-block;
                      padding: 14px 24px;
                      font-size: 26px;
                      letter-spacing: 6px;
                      font-weight: bold;
                      color: #0a344f;
                      background-color: #f0f4f8;
                      border-radius: 6px;
                    "
                  >
                    ${otp}
                  </div>
                </div>

                <p style="font-size: 13px; color: #666666; margin: 0 0 20px">
                  ⏱️ This code will expire in
                  <strong>15 minutes</strong>. For security
                  reasons, please do not share this code with anyone.
                </p>

                <p style="font-size: 13px; color: #666666; margin: 0">
                  If you did not initiate this registration, you can safely
                  ignore this email — no action will be taken on your account.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background-color: #f9fafb;
                  padding: 20px;
                  text-align: center;
                "
              >
                <p style="font-size: 12px; color: #888888; margin: 0">
                  © ${year} NeoBank. All rights reserved.
                </p>
                <p style="font-size: 12px; color: #888888; margin: 6px 0 0">
                  🔒 This is an automated security message. Please do not reply.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`