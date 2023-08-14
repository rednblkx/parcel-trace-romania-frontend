import { Outlet, useNavigation, Link } from "react-router-dom";
import "./App.css";
import NavBar from "./NavBar";
import ShipmentsList from "./routes/shipment/shipmentsList";
import { Button, Flex, Icon, Spinner, useColorModeValue } from "@chakra-ui/react";
import { BsPlus } from "react-icons/bs";
import localforage from "localforage";
import CarrierList from "./carriers.json";
import { useEffect } from "react";
import { supabase } from "./supabase";
import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";

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

  useEffect(() => {
    let data = async () => {
      if (navigator.serviceWorker) {
        let randomUUID = crypto.randomUUID();
        const deviceId = localStorage.getItem("deviceId");
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub || deviceId) {
            let { data } = await supabase.from("subscriptions").select("*").eq("deviceId", deviceId).limit(1).single() as PostgrestSingleResponse<{ id: number, created_at: Date, endpoint: string, keys: Record<string, string>, user_id: string, expirationTime: string, last_refresh: Date, deviceId: string }>;
            let push = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: base64UrlToUint8Array(import.meta.env.VITE_PUBLIC_VAPID_KEY || "")
            })
            const { error } = await supabase.from("subscriptions").update({ ...data, ...push.toJSON(), deviceId: deviceId || randomUUID, last_refresh: new Date() }).eq("id", data?.id);
            if (!deviceId) {
              localStorage.setItem("deviceId", randomUUID);
            }
            console.log(error);
          }
        }
      }
    }
    data().catch(console.error)
  }, [])

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
