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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function GoogleButton({onClick}: {onClick: Function}) {
  return (
    <Center p={8}>
      <Button
        onClick={() => onClick()}
        w={'full'}
        maxW={'md'}
        variant={'outline'}
        leftIcon={<FcGoogle />}>
        <Center>
          <Text>Sign in with Google</Text>
        </Center>
      </Button>
    </Center>
  );
}


async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  console.log(data);
  
}

async function signout() {
  const { error } = await supabase.auth.signOut()
  console.error(error)
}

function AuthProfile() {
  let navigate = useNavigate();
  let userInfo = useLoaderData() as User | null;
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
          {(userInfo && (
            <Flex align="center">
              <Icon w="16" h="16" as={FaUserCircle} mr="2"/>
              <Heading>{userInfo.user_metadata.full_name}</Heading>
              <Spacer />
              <Button onClick={() => signout()}>Sign out</Button>
            </Flex>
          )) || (
            <Flex
              flexDirection="column"
              w="100%"
              h="32"
              justifyContent="space-around"
              alignItems="center"
            >
              <GoogleButton onClick={signInWithGoogle}/>
              {/* <Button as={Link} to="/auth/signup">Sign up</Button> */}
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AuthProfile;
