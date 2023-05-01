import { SigninMessage } from "utils/signin-message";

export const validateSignedMessage = (
  signedMessage: string,
  stringMessage: string,
  nonce: string,
  csrf?: string
) => {
  const message = new SigninMessage(stringMessage);
  const isValid = message.validate(signedMessage);

  console.log("nonce:", nonce, "csrf: ", csrf);
  if (!isValid || nonce != csrf) {
    throw new Error("Could not validate the signed message");
  }
};
