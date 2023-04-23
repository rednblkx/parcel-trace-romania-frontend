import { Button } from "@chakra-ui/button";
import { Icon } from "@chakra-ui/icon";
import { Flex, Spacer } from "@chakra-ui/layout";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { Link } from "react-router-dom";
import { Avatar, Input, useColorMode } from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "./Auth";

function NavBar() {
  const { user } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      align="center"
      justify="center"
      w="100vw"
      h="14"
      pos="sticky"
      bg={colorMode === "light" ? "white" : "gray.800"}
      top="0"
      zIndex={1}
    >
      <Input placeholder="Search Shipment" mx="2" shadow="sm" />
      <Spacer />
      <Button
        variant="ghost"
        shadow="sm"
        onClick={toggleColorMode}
        style={{ WebkitTapHighlightColor: "transparent" }}
        // mx="1"
        bg={colorMode === "dark" ? "blackAlpha.400" : "whiteAlpha.400"}
      >
        <Icon
          w="4"
          h="4"
          as={colorMode === "light" ? MdLightMode : MdDarkMode}
        />
      </Button>
      <Button
        variant="link"
        as={Link}
        to="profile"
        // style={{ WebkitTapHighlightColor: "transparent" }}
        mx="3"
        py="2"
        // bg={colorMode === "dark" ? "blackAlpha.400" : "whiteAlpha.400"}
      >
        {user ? <Avatar name={user.user_metadata.full_name} src={ user.user_metadata.avatar_url } size="sm" /> : <Icon w="6" h="6" as={FaUserCircle} />}
      </Button>
    </Flex>
  );
}

export default NavBar;
