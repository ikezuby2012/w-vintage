import Joi from "joi";
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(5007),
    LOCAL_MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    ATLAS_MONGODB_URL: Joi.string().optional(),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.string()
      .default("7d")
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    JWT_COOKIE_EXPIRES_IN: Joi.number().description(
      "minutes after which cookie tokens expire"
    ),
    SENDINBLUE_EMAIL: Joi.string().description(
      "the from field in the emails sent by the app -- sendinBlue platform"
    ),
    SENDINBLUE_PASSWORD: Joi.string().description(
      "password for SendInBlue email SMTP server"
    ),
    SENDINBLUE_API_KEY: Joi.string().description(
      "sendInBlue Api key for SMTP email server"
    ),
    ADMIN_FIELD_KEY: Joi.string().required().description("Admin only field key"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  adminFieldKey: envVars.ADMIN_FIELD_KEY,
  mongoose: {
    url: envVars.NODE_ENV === "development" ?
      envVars.LOCAL_MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : "") : envVars.ATLAS_MONGODB_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    cookieExpiresIn: envVars.JWT_COOKIE_EXPIRES_IN,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    cookieOptions: {
      httpOnly: true,
      secure: envVars.NODE_ENV === "production",
      signed: true,
    },
  },
  sendBlue: {
    email: envVars.SENDINBLUE_EMAIL,
    pass: envVars.SENDINBLUE_PASSWORD,
    api_key: envVars.SENDINBLUE_API_KEY,
  },
};

export default config;
