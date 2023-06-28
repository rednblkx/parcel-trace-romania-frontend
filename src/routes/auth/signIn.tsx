import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useColorMode,
} from "@chakra-ui/react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-react/dist/esm/common/theming/defaultThemes";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

function SignIn() {
  let navigate = useNavigate();
  let {colorMode, setColorMode} = useColorMode();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  return (
    <Modal isOpen={true} onClose={() => navigate("..")} isCentered={true}>
      <ModalOverlay />
      <ModalContent mx="2">
        <ModalHeader>Sign in</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
            redirectTo={`${new URL(import.meta.url).origin}/profile`}
            onlyThirdPartyProviders={true}
            dark={colorMode === "dark" ? true : false}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default SignIn;
