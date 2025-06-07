import type { NextApiRequest, NextApiResponse } from "next";
import { SigninMessage } from "utils/signin-message";
import { getCsrfToken } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔍 DEBUG AUTH - Request body:", req.body);
    
    const { message, signature } = req.body;
    
    if (!message || !signature) {
      return res.status(400).json({ error: "Missing message or signature" });
    }

    console.log("🔍 DEBUG AUTH - Parsing message:", message);
    const signinMessage = new SigninMessage(message);
    console.log("🔍 DEBUG AUTH - Parsed message:", signinMessage);

    console.log("🔍 DEBUG AUTH - Getting CSRF token...");
    const nonce = await getCsrfToken({ req: { headers: req.headers } });
    console.log("🔍 DEBUG AUTH - CSRF token:", nonce);

    console.log("🔍 DEBUG AUTH - Validating signature...");
    const validationResult = signinMessage.validate(signature);
    console.log("🔍 DEBUG AUTH - Validation result:", validationResult);

    return res.status(200).json({
      success: true,
      message: "Debug complete",
      data: {
        parsedMessage: signinMessage,
        nonce,
        nonceMatch: signinMessage.nonce === nonce,
        signatureValid: validationResult
      }
    });
  } catch (error) {
    console.error("🔍 DEBUG AUTH - Error:", error);
    return res.status(500).json({ 
      error: "Debug failed", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
}