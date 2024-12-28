import { useCart } from "@/components/cart";
import { LoginForm } from "@/components/header/store/login/login-form";

export const LoginDialog = ({ editionState, close }: { editionState: [string | null, React.Dispatch<"java" | "bedrock">]; close: () => void }) => {
  const setPlayer = useCart((state) => state.setPlayer);
  return (
    <LoginForm
      editionState={editionState}
      onSelect={(player) => {
        setPlayer(player);
        close();
      }}
    />
  )
}