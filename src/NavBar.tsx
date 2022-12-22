import { Button } from "@chakra-ui/button";
import { Icon } from "@chakra-ui/icon";
import { Box, Center, Flex, Heading, Spacer, Text } from "@chakra-ui/layout";
import { MdMenu, MdSearch, MdLightMode, MdDarkMode } from 'react-icons/md'
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useColorMode } from "@chakra-ui/react";
import { FaSun, FaMoon } from 'react-icons/fa';

function NavBar() {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex align="center" justify="center" w="100vw" h="14" pos="sticky" bg={colorMode === "light" ? "white" : "gray.800"} top="0">
      {/* <Center h="12"> */}
        {/* <Button m={2}><Icon as={MdMenu}></Icon></Button>
        <Spacer/>
        <Link to="/shipments/add"><Button m={2}>Add</Button></Link> */}
        <Button variant="ghost" shadow="md" m={2} style={{WebkitTapHighlightColor: 'transparent'}} bg={colorMode === "dark" ? "blackAlpha.400" : "whiteAlpha.400"}><Icon as={MdMenu}></Icon></Button>
        <Spacer/>
        <Heading>Shipments</Heading>
        <Spacer />
        <Button variant="ghost" shadow="md" onClick={toggleColorMode} style={{WebkitTapHighlightColor: 'transparent'}} bg={colorMode === "dark" ? "blackAlpha.400" : "whiteAlpha.400"}>
          <Icon as={colorMode === 'light' ? MdLightMode : MdDarkMode}/>
        </Button>
        <Button variant="ghost" shadow="md" m={2} style={{WebkitTapHighlightColor: 'transparent'}} bg={colorMode === "dark" ? "blackAlpha.400" : "whiteAlpha.400"}><Icon as={MdSearch}></Icon></Button>
      {/* </Center> */}
    </Flex>
  )
}

export default NavBar;