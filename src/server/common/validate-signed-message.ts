import { SigninMessage } from "utils/signin-message";

export const validateSignedMessage = (
  signedMessage: string,
  stringMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nonce: string
) => {
  const message = new SigninMessage(stringMessage);
  const isValid = message.validate(signedMessage);

  if (!isValid) {
    throw new Error("Could not validate the signed message");
  }
};
