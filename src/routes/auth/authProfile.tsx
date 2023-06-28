import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Switch,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth";
import { IParcelMonitor, IParcelMonitorResponse } from "../../main";
import { supabase } from "../../supabase";
import { useEffect, useState } from "react";

function base64UrlToUint8Array(base64UrlData: string) {
  const padding = "=".repeat((4 - (base64UrlData.length % 4)) % 4);
  const base64 = (base64UrlData + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

function AuthProfile() {
  let navigate = useNavigate();
  let loader = useLoaderData() as IParcelMonitorResponse;
  let toast = useToast();

  let [shipments, setShipments] = useState(loader?.data ?? []);
  let [notificationEnabled, setNotifications] = useState(false);
  let [supported, setSupported] = useState(
    navigator.serviceWorker && Notification ? true : false
  );

  const publicApplicationKey = base64UrlToUint8Array(
    "BMBXR2-2GL2qPY7u-w6ICu3vmzJPa89M_63e35-DZvycuVQsHs4FPzwLB6AsV0spANBpoVYz1UzJLOrNHe0z_Hg"
  );

  useEffect(() => {
    if (loader?.error) {
      console.error(loader?.error);

      toast({
        title: "Something went wrong",
        description: loader?.error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    navigator.serviceWorker &&
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((subscription) => {
          subscription && setNotifications(true);
        });
      });
  }, []);

  let { user } = useAuth();

  const permissionRequest = async () => {
    if (navigator.serviceWorker && Notification) {
      if (!notificationEnabled) {
        const permission = await Notification.requestPermission();

        if (permission == "granted") {
          const reg = await navigator.serviceWorker.ready;
          const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicApplicationKey,
          });

          setNotifications(true);

          let res = await fetch("api/subscription", {
            method: "POST",
            body: JSON.stringify({
              ...subscription.toJSON(),
              user_id: user?.id,
            }),
            headers: { "Content-Type": "application/json" },
          });
          console.log(res);
        }
      } else {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();
        const endpoint = subscription?.endpoint;
        subscription
          ?.unsubscribe()
          .then(async (successful) => {
            // You've successfully unsubscribed
            console.log("Push notifications unsubscribed");
            const { error } = await supabase
              .from("subscriptions")
              .delete()
              .eq("endpoint", endpoint);
            console.log(error);
            setNotifications(false);
          })
          .catch((e) => {
            // Unsubscribing failed
            console.log("Push notifications unsubscribe failed!");
          });
      }
    } else {
      setSupported(false);
    }
  };
  return (
    <Modal isOpen={true} onClose={() => navigate("..")} isCentered={true}>
      <ModalOverlay />
      <ModalContent mx="2">
        <ModalHeader display="flex" alignItems="center">
          <Link to="..">
            <IconButton aria-label="Back" icon={<MdArrowBack />} mr="2" />
          </Link>
          <Text>Your profile</Text>
        </ModalHeader>
        {/* <ModalCloseButton mt={1} /> */}
        <ModalBody>
          {(user && (
            <>
              <Flex align="center">
                <Avatar src={user.user_metadata.avatar_url} mr="2" />
                <Flex direction="column" flex="1">
                  <Heading>{user.user_metadata.full_name}</Heading>
                  <Text>{user.email}</Text>
                </Flex>
                {/* <Spacer /> */}
                <Button as={Link} to="/auth/logout">
                  Sign out
                </Button>
              </Flex>
              <Flex mt="2" direction="column">
                <FormControl isInvalid={!supported}>
                  <Flex align="center">
                    <FormLabel htmlFor="push-notifications" mb="0">
                      Enable notifications?
                    </FormLabel>
                    <Switch
                      id="push-notifications"
                      isChecked={notificationEnabled}
                      onChange={permissionRequest}
                      isDisabled={!supported}
                    />
                  </Flex>
                  <FormErrorMessage>
                    ServiceWorkers or Notifications API not supported by your
                    browser.
                  </FormErrorMessage>
                </FormControl>
                {/* {!supported && (
                  <Text mt={2}>
                    Your Ntfy.sh link:{" "}
                    <b>
                      <a
                        href={`https://ntfy.kodeeater.xyz/parcel-romania-${user.id.slice(
                          0,
                          8
                        )}`}
                      >
                        https://ntfy.kodeeater.xyz/parcel-romania-
                        {user.id.slice(0, 8)}
                      </a>
                    </b>
                  </Text>
                )} */}
              </Flex>
            </>
          )) || (
            <Flex
              flexDirection="column"
              w="100%"
              h="32"
              justifyContent="space-around"
              alignItems="center"
            >
              <Heading>Not logged in!</Heading>
              {/* <Button as={Link} to="/auth/signup">Sign up</Button> */}
            </Flex>
          )}
          <Divider my="6" />
          {user && (
            <>
              <Heading as="h3" size="lg" mb="4" textAlign="center">
                Watched Parcels
              </Heading>
              <VStack align="left" mb="2" maxH={["10rem", "30rem"]} overflow="auto">
                {shipments.length ? (
                  shipments.map((parcel, i) => (
                    <Card bgColor="whiteAlpha.200" key={i}>
                      <CardBody display="flex" alignItems="center">
                        <Box>
                          <Text>{parcel.tracking_id}</Text>
                          <Text as="b">{parcel.carrier_id.name}</Text>
                        </Box>
                        <Spacer />
                        <Button
                          colorScheme="red"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("parcels_monitoring")
                              .delete()
                              .eq("tracking_id", parcel.tracking_id);

                            if (error) {
                              toast({
                                title: "Something went wrong",
                                description: error.message,
                                status: "error",
                                duration: 3000,
                                isClosable: true,
                              });
                            } else {
                              toast({
                                title: `Parcel ${parcel.tracking_id} removed`,
                                description:
                                  "Parcel has been removed from the watching list",
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                              });
                            }
                            setShipments(
                              shipments.filter(
                                (a) => a.tracking_id != parcel.tracking_id
                              )
                            );
                          }}
                        >
                          Delete
                        </Button>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Card bgColor="whiteAlpha.200">
                    <CardBody
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text>No shipments!</Text>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AuthProfile;
