import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { createClient, User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { Link, useLoaderData, useNavigate } from "react-router-dom";

import { FcGoogle } from "react-icons/fc";
import { Center } from "@chakra-ui/react";
import { useAuth } from "../../Auth";
import { IParcelMonitor, IParcelMonitorResponse } from "../../main";
import { supabase } from "../../supabase";
import { useEffect, useState } from "react";

function AuthProfile() {
  let navigate = useNavigate();
  let loader = useLoaderData() as IParcelMonitorResponse;
  let toast = useToast();

  let [shipments, setShipments] = useState(loader?.data ?? []);

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
  }, []);

  let { user } = useAuth();
  return (
    <Modal isOpen={true} onClose={() => navigate("..")} isCentered={true}>
      <ModalOverlay />
      <ModalContent>
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
            <GridItem>
              <Text>Your profile</Text>
            </GridItem>
          </Grid>
        </ModalHeader>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          {(user && (
            <>
              <Flex align="center">
                <Icon w="12" h="12" as={FaUserCircle} mr="2" />
                <Flex direction="column" flex="1">
                  <Heading>{user.user_metadata.full_name}</Heading>
                  <Text>{user.email}</Text>
                </Flex>
                {/* <Spacer /> */}
                <Button as={Link} to="/auth/logout">
                  Sign out
                </Button>
              </Flex>
              <Flex mt="2">
                <Text>Your Ntfy.sh link: <b><a href={`https://ntfy.kodeeater.xyz/parcel-romania-${user.id.slice(0, 8)}`}>https://ntfy.kodeeater.xyz/parcel-romania-{user.id.slice(0, 8)}</a></b> </Text>
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
              <VStack align="left" mb="2">
                {shipments.length ? (
                  shipments.map((parcel) => (
                    <Card bgColor="whiteAlpha.200">
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
