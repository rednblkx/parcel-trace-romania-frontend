import { Outlet, useNavigation, Link } from "react-router-dom";
import "./App.css";
import NavBar from "./NavBar";
import ShipmentsList from "./routes/shipment/shipmentsList";
import { Button, Flex, Icon, Spinner, useColorModeValue } from "@chakra-ui/react";
import { BsPlus } from "react-icons/bs";
import localforage from "localforage";
import CarrierList from "./carriers.json";
import { useEffect } from "react";

function App() {
  localforage.getItem("carriers").then(async (element) => {
    if (!element) {
      await localforage.setItem("carriers", CarrierList);
    }
  });
  const navigation = useNavigation();
  const colorMode = useColorModeValue("#ffffff", "#1A202C")

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colorMode)
  }, [colorMode])

  return (
    <>
      {navigation.state === "loading" && <Flex bgColor="blackAlpha.600" pos="fixed" align={"center"} justify="center" w="full" h="100dvh" zIndex="9999">
        <Spinner size={"xl"} color="white"/>
      </Flex>}
      <NavBar />
      <ShipmentsList />
      <Button
        pos="fixed"
        right="16px"
        bottom="16px"
        pl="16px"
        pr="16px"
        colorScheme="teal"
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
          color: "rgba(0, 0, 0, 0)",
        }}
        _active={{
          // bg: "teal.500",
          transform: "scale(0.98)",
          borderColor: "#bec3c9",
          outline: "none",
          userSelect: "none",
        }}
        _focus={{
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
          outline: "none",
          userSelect: "none",
        }}
        lineHeight="1.2"
        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* {navigation.state === "loading" &&
          navigation.location.pathname === "/shipment/add" && (
            <Spinner pos="absolute" w="56px" h="56px" thickness="3px" />
          )} */}
        <Icon w="32px" h="32px" as={BsPlus} />
      </Button>
      <Outlet />
    </>
  );
}

export default App;

// export function useFocusRefOnModalClose() {
//   return useOutletContext<React.RefObject<HTMLDivElement>>();
// }
