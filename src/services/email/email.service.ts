import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

import config from "../../config";
import { passwordReset } from "./templates/passwordReset.template";
import { sendVerifyOtp } from "./templates/sendVerifyOtp.template";
import { sendOtpRequest } from "./templates/sendOtpRequest.template";
import { resetUserPasswordEmail } from "./templates/resetUserpassword.template";
import { resetPinEmailTemplate } from "./templates/resetPinEmail.template";
import { sendLoginOtpEmailTemplate } from "./templates/confirmOtpLogin.template";

const { api_key: ApiKey } = config.sendBlue;

const apiInstance = new TransactionalEmailsApi();

// Configure API key for Brevo
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, ApiKey);

const senderName = "Wealth Vintage";
const senderEmail = config.sendBlue.email ?? "info@wealthvintage.com";

const completeAction = (html: string, userMail: string, userName: string, subject?) => {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.subject = subject ?? "welcome! we want to confirm your account";
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: senderName,
    email: senderEmail,
  };
  sendSmtpEmail.to = [
    {
      email: userMail,
      name: userName,
    },
  ];

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(`Email API called successfully. Returned data: ${data}`);
    },
    function (error) {
      console.error(error);
    }
  );
}

export const sendOtpEmail = (
  userMail: string,
  userName: string,
  pin: string
) => {
  console.log("Sending OTP email to:", userMail, ApiKey);

  const html = sendVerifyOtp(userName, pin, new Date().getFullYear().toString());

  completeAction(html, userMail, userName);
};

export const sendPasswordReset = (userMail: string, pin: string) => {
  const html = passwordReset(pin);
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.subject = "Reset Your Password!";
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: senderName,
    email: senderEmail,
  };
  sendSmtpEmail.to = [
    {
      email: userMail,
      name: "name",
    },
  ];

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(`Email API called successfully. Returned data: ${data}`);
    },
    function (error) {
      console.error(error);
    }
  );
};

export const sendOtpRequestMail = (
  userMail: string,
  userName: string,
  pin: string
) => {
  console.log("Sending OTP email to:", userMail, ApiKey);

  const html = sendOtpRequest(userName, pin, new Date().getFullYear().toString());

  completeAction(html, userMail, userName, "Complete your action");
};

export const sendPasswordResetAdmin = (userName: string, userMail: string, defaultPassword: string) => {
  const html = resetUserPasswordEmail(userName, new Date().getFullYear().toString(), defaultPassword);

  completeAction(html, userMail, userName, "Password reset!");
};

export const sendResetPinEmail = (userName: string, userMail: string, pin: string) => {
  const html = resetPinEmailTemplate({ name: userName, otp: pin });
  completeAction(html, userMail, userName, "Reset Your Card PIN");
};

export const sendLoginOtpEmail = (userName: string, userMail: string, otp: string) => {
   const html = sendLoginOtpEmailTemplate(userName, otp);
   completeAction(html, userMail, userName, "Login Verification Code");
}