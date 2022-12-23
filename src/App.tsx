import { Box, Center, Flex, Heading, StackDivider, Text, VStack } from "@chakra-ui/layout";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
  redirect,
  Navigate,
  useNavigation,
  useLocation,
  Link,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useRef } from "react";
import "./App.css";
import Card from "./Card";
import NavBar from "./NavBar";
import ShipmentDetails from "./routes/shipmentDetails";
import ShipmentsList from "./routes/shipmentsList";
import { Button, Icon, IconButton, Spinner } from "@chakra-ui/react";
import { BsPlus } from "react-icons/bs";

function App() {
  // let location = useLocation();987036795
  const navigation = useNavigation();
  
  let focusRef = useRef<HTMLDivElement>(null);
  // const navigate = useNavigate();
  // useEffect(() => {
  //   navigate("/shipments")
  // }, [])
  
  return (
    <>
      <NavBar />
      <ShipmentsList ref={focusRef} />
      {/* <Center
        pos="absolute"
        right="12"
        bottom="10"
        h="60px"
        w="60px"
      > */}
      <Button
        pos="fixed"
        right="16px"
        bottom="16px"
        pl="16px"
        pr="16px"
        colorScheme='teal'
          as={Link}
          to="/shipment/add"
          h="56px"
          w="56px"
          borderRadius="56px"
          // border="1px"
          // borderColor="#ccd0d5"
          // _hover={{ bg: "#ebedf0" }}
          shadow="md"
          _highlighted={{
            color: "rgba(0, 0, 0, 0)"
          }}
          _active={{
            // bg: "teal.500",
            transform: "scale(0.98)",
            borderColor: "#bec3c9",
            outline: "none",
            userSelect: "none"
          }}
          _focus={{
            boxShadow:
              "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
            outline: "none",
            userSelect: "none"
          }}
          lineHeight="1.2"
        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
        style={{WebkitTapHighlightColor: 'transparent'}}
        >
          {(navigation.state === "loading" && navigation.location.pathname === "/shipment/add") && <Spinner pos="absolute" w="56px" h="56px" thickness='3px'/>}
          <Icon w="32px" h="32px" as={BsPlus} />
        </Button>
      {/* </Center> */}
      {/* <Box pos="fixed" bottom="8" right="4" w="250px" h="80px" bg="green.400" zIndex="999999" borderRadius="8px" shadow="md">
        <Center w="250px" h="80px">
          <Heading fontSize="1xl">Shipment marked as delivered</Heading>
        </Center>
      </Box> */}
      <Outlet context={{focusRef}} />
    </>
  );
}

export default App;


export function useFocusRefOnModalClose() {
  return useOutletContext<React.RefObject<HTMLDivElement>>();
}