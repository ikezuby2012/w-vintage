import speakeasy from "speakeasy";

const secret = speakeasy.generateSecret({ length: 6 });

/**
 * Generate one-time password
 * @returns {String}
 */
export const generateOtp = (): string => {
  return speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    step: 600,
  });
};

/**
 * verify OTP
 * @param {string} token
 * @returns {boolean}
 */
export const verifyOtp = (token: string) => {
  return speakeasy.totp.verify({
    secret: secret.base32,
    encoding: "base32",
    token,
    step: 600,
    window: 2,
  });
};
