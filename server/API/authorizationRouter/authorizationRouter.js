import express from "express";
import { fetchPassword } from "../../Database/mysql.js";
import { loggerLogin, loggerLogout } from "../../Utils/logger.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { asyncWrapper } from "../../Utils/asyncWrapper.js";
import { ERR_CODES } from "../../Constants/StatusCodes/errorCodes.js";
import { passwordSchema } from "./inputSchemas.js";

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXP = process.env.TOKEN_EXP;

authRouter.post(
  "/login",
  asyncWrapper(async (req, res) => {
    loggerLogin.info("↘️ Received a new login attempt.");
    const reqParsed = passwordSchema.parse(req.body);

    const password = await fetchPassword();
    const areMatching = await bcrypt.compare(reqParsed.password, password);
    if (areMatching) {
      loggerLogin.info(`✅ Password correct.`);

      // Generate a JWT token valid for 1 hour
      // Default headers: { "alg": "HS256", "typ": "JWT" } Claims on payload: { "iat": xxx, "exp": xxx }
      const JWTtoken = jwt.sign({}, JWT_SECRET, {
        expiresIn: `${TOKEN_EXP}ms`,
      });

      // Send the JWT token as a HttpOnly, Secure, SameSite cookie
      res.cookie("auth_token", JWTtoken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: parseInt(TOKEN_EXP),
      });
      res.status(200).json({ status: "success" });
    } else {
      loggerLogin.warn(
        `❌ Invalid password. Responding with 401 Unauthorized.`
      );
      res
        .status(401)
        .json({ status: "error", errorCode: ERR_CODES.INVALID_PASSWORD_ERR });
    }
  })
);

authRouter.post(
  "/logout",
  asyncWrapper(async (req, res) => {
    loggerLogout.info("↖️ Received a new logout request.");

    // Clear the JWT token cookie (sets the Expiration Date of the cookie to a date in the past)
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({ status: "success" });
    loggerLogout.info(`Auth cookie cleared.`);
  })
);

// authRouter.get("/test", JWTverificator, async (req, res) => {
//   loggerMain.info("📩 [/test] Received a new GET request.");
//   res.status(200).json({ status: "success" });
// });
