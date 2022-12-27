import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Form, useNavigate, useParams } from "react-router-dom";

function ShipmentRemove() {
  // let { trackingid } = useParams();
  let navigate = useNavigate();
  let toast = useToast();

  return (
    <Modal isOpen={true} onClose={() => navigate("..")} isCentered={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Sure you want to remove this?</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={() => navigate("..")}>
            No
          </Button>
          <Form method="post" action="">
            <Button
              variant="outline"
              type="submit"
              onClick={() => {
                toast({
                  title: "Shipment has been removed",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                });
              }}
            >
              Yes, please!
            </Button>
          </Form>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ShipmentRemove;
