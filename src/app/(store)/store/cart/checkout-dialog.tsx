import { env } from "@/env";
import Turnstile from "react-turnstile";

export const CaptchaDialog = ({ keyState, done }: {
  keyState?: [string | null, React.Dispatch<React.SetStateAction<string | null>>]
  done: (token: string) => void;
}) => {
  if (!env.TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <p>Please complete the captcha to continue...</p>
      <Turnstile
        sitekey={env.TURNSTILE_SITE_KEY}
        className="place-self-center"
        onVerify={(token: string) => {
          if (keyState) {
            keyState[1](token);
          }
          done(token);
        }}
      />
    </>
  )
}