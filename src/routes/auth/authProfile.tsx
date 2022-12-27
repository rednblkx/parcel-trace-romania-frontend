import {
  Button,
  ButtonGroup,
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
} from "@chakra-ui/react";
import { createClient, User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { Link, useLoaderData, useNavigate } from "react-router-dom";


import { FcGoogle } from 'react-icons/fc';
import { Center } from '@chakra-ui/react';
import { useAuth } from "../../Auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function AuthProfile() {
  let navigate = useNavigate();
  // let userInfo = useLoaderData() as User | null;
  let { user, signOut } = useAuth()
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
            <Flex align="center" mb="2">
              <Icon w="12" h="12" as={FaUserCircle} mr="2" />
              <Flex direction="column">
                <Heading>{user.user_metadata.full_name}</Heading>
                <Text>{user.email}</Text>
              </Flex>
              <Spacer />
              <Button onClick={() => { navigate("/auth/login"); signOut();}}>Sign out</Button>
            </Flex>
          ))
            || (
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
            )
          }
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AuthProfile;
