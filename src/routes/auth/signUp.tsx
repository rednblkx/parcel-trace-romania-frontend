import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  let navigate = useNavigate();
  return (
    <Modal isOpen={true} onClose={() => navigate("..")}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default SignUp;
