import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import {
  Button,
  ButtonGroup,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Skeleton,
  SkeletonCircle,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { MdArrowBack, MdCabin } from "react-icons/md";
import {
  useParams,
  Link,
  useLoaderData,
  redirect,
  Outlet,
  useNavigate,
  useSubmit,
  useActionData,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { IShipment } from "./shipmentsList";
import localforage from "localforage";
import {
  FaBalanceScale,
  FaBox,
  FaClipboardList,
  FaClock,
  FaTrash,
  FaTruck,
  FaTruckLoading,
  FaTruckMoving,
  FaWarehouse,
} from "react-icons/fa";
import { TbTruckLoading } from "react-icons/tb";
import { BsCheck } from "react-icons/bs";
import { carriers } from "./shipmentAdd";
import { IRes } from "../../main";
import { IconType } from "react-icons/lib";
import { useFocusRefOnModalClose } from "../../App";

const DELIVERED = 99;
const SAMEDAY_LOADED_LOCKER = 78;
const SAMEDAY_BUSY_LOCKER = 79;
const ON_DELIVERY = 5;
const IN_WAREHOUSE = 4;
const IN_TRANSIT = 3;
const PICKED_UP = 2;
const ORDER_CREATED = 1;
const CARGUS_WEIGHTING = 20;

export const status_icons: { [id: number]: IconType } = {
  [IN_WAREHOUSE]: FaWarehouse,
  [IN_TRANSIT]: FaTruckMoving,
  [PICKED_UP]: FaTruckLoading,
  [ON_DELIVERY]: FaTruckMoving,
  [DELIVERED]: FaBox,
  [ORDER_CREATED]: FaClipboardList,
  [CARGUS_WEIGHTING]: FaBalanceScale,
  [SAMEDAY_LOADED_LOCKER]: TbTruckLoading,
  [SAMEDAY_BUSY_LOCKER]: FaClock,
};

export async function getShipment(trackingid: string) {
  let list: IShipment[] | null = await localforage.getItem("shipmentList");
  let carriers: carriers[] | null = await localforage.getItem("carriers");
  let shipment = list?.find((el) => el.id === trackingid);

  return { carriers, shipment };
}

async function markDelivered(tracking_id: string) {
  try {
    let list: IShipment[] = (await localforage.getItem(
      "shipmentList"
    )) as IShipment[];
    let parcel: number = list.findIndex((el) => el.id === tracking_id);
    let new_status: IShipment = {
      ...list[parcel],
      statusId: 99,
    };

    list[parcel] = new_status;

    await localforage.setItem("shipmentList", list);
    return 1;
  } catch (error) {
    console.error(error);
  }
}

function StepDetail({
  status,
  statusId,
  location,
  statusDate,
}: {
  status: string;
  statusId: number;
  location: string;
  statusDate: string;
}) {
  return (
    <Flex direction="row" align="center" p="3">
      <Icon as={status_icons[statusId]} w={8} h={8} mr={4} />
      <Box>
        <Heading fontSize="xl" textAlign="start">
          {status}
        </Heading>
        <Text textAlign="start" mt={2}>
          {location}
        </Text>
        <Text textAlign="start" mt={2}>
          {new Date(statusDate).toLocaleString()}
        </Text>
      </Box>
    </Flex>
  );
}

interface loaderData {
  carriers: carriers[];
  shipment: IShipment;
}

function ShipmentDetails() {
  let { trackingid } = useParams() as { trackingid: string };
  let { carriers, shipment } = useLoaderData() as loaderData;
  let navigate = useNavigate();
  let submit = useSubmit();
  let focusRef = useRef(null);
  let toast = useToast();
  let focusRefClose = useFocusRefOnModalClose();

  useEffect(() => {
    submit(null, { method: "post", action: `/shipment/${trackingid}` });
  }, []);

  return (
    <>
      <Modal
        isOpen={true}
        onClose={() => navigate("..")}
        isCentered={true}
        scrollBehavior="inside"
        initialFocusRef={focusRef}
        finalFocusRef={focusRefClose}
      >
        <ModalOverlay />
        <ModalContent minH="300px">
          <ModalHeader>
            <Grid
              templateColumns="var(--chakra-sizes-10) 1fr"
              alignItems="center"
              gap="2"
              // align="center"
              // w="100%"
              // p="5"
              // pos="sticky"
              // top="0"
              // bg={colorMode === "light" ? "whiteAlpha.900" : "gray.900"}
              // shadow="md"
            >
              <GridItem>
                <Link to="..">
                  <IconButton aria-label="Back" icon={<MdArrowBack />} mr="2" />
                </Link>
              </GridItem>
              <GridItem noOfLines={1}>
                <Heading w={"100%"} noOfLines={1}>
                  #{trackingid}
                </Heading>
                <Heading as="h3" size="sm" noOfLines={1}>
                  {shipment.status}
                </Heading>
              </GridItem>
            </Grid>
          </ModalHeader>
          {/* <ModalCloseButton /> */}
          <ModalBody>
            {shipment ? (
              <VStack align="start" w="100%" >
                <Box w="100%" ref={focusRef}>
                  {shipment.history?.map((el, i) => (
                    <StepDetail
                      status={el.status}
                      statusId={el.statusId}
                      key={`${el.status + el.statusDate + i}`}
                      location={`${el.country ?? ""} ${el.county}`}
                      statusDate={el.statusDate}
                    />
                  )) || null}
                  {/* {shipment.history?.length === 0 && (
                    <Progress size="xs" isIndeterminate />
                  )} */}
                  {shipment.history?.length === 0 && <Stack>
                    <HStack>
                      <SkeletonCircle size="10" />
                      <Skeleton height="20px" width="100%" />
                    </HStack>
                    <HStack>
                      <SkeletonCircle size="10" />
                      <Skeleton height="20px" width="100%" />
                    </HStack>
                    <HStack>
                      <SkeletonCircle size="10" />
                      <Skeleton height="20px" width="100%" />
                    </HStack>
                  </Stack>}
                  {/* <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} />
                  <StepDetail status={"Delivery"} location={"Here"} /> */}
                </Box>
                <Divider orientation="horizontal" />
                <Text>
                  Carrier:{" "}
                  {carriers.find((id) => shipment.carrier === id.id)?.name}
                </Text>
                <Text>
                  Added At: {new Date(shipment.createdAt).toLocaleString()}
                </Text>
                <Text>
                  Updated At: {new Date(shipment.updatedAt).toLocaleString()}
                </Text>
                <Divider orientation="horizontal" />
              </VStack>
            ) : (
              <Center w="100%">
                <Heading>Shipment not added</Heading>
              </Center>
            )}
          </ModalBody>

          <ModalFooter>
            {/* <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button> */}
            <ButtonGroup gap="2">
              <Button
                w="12"
                onClick={async () => {
                  let mark = await markDelivered(trackingid);
                  if (mark === 1) {
                    toast({
                      title: "Shipment marked as delivered",
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                  }
                }}
              >
                <Icon color="green.500" w="8" h="8" as={BsCheck} />
              </Button>
              <Button as={Link} to="remove">
                <Icon color="red.500" as={FaTrash} />
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Outlet />
    </>
  );
}

export default ShipmentDetails;