import { Button } from "@chakra-ui/button";
import { Icon } from "@chakra-ui/icon";
import { Box, Flex, Heading, Spacer, Text } from "@chakra-ui/layout";
import { useColorMode } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { MdCabin } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { status_icons } from "./routes/shipmentDetails";

function Card({ id, status, statusId, ...rest }: any) {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    // <Button w="100%" h="100%">
    <Link to={`shipment/${id}`} style={{height: "fit-content", WebkitTapHighlightColor: 'transparent'}}>
      <Flex
        _hover={{ bg: colorMode === "light" ? "#ebedf0" : "#545c68" }}
        transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
        _active={{
          bg: colorMode === "light" ? "#dddfe2" : "#4e688f",
          transform: "scale(0.98)",
          borderColor: "#bec3c9",
        }}
        bg={colorMode === "dark" ? "blackAlpha.400" : "whiteAlpha.400"}
        p={5}
        shadow="md"
        borderRadius="5px"
        // borderWidth="1px"
        flexDirection="row"
        align={"center"}
        {...rest}
      >
        <Icon as={status_icons[statusId]} w={8} h={8} mr={4} />
        <Box>
          <Text as="b" textAlign="start" noOfLines={1}>
            {id}
          </Text>
          <Text textAlign="start" mt={2} noOfLines={1}>
            {status}
          </Text>
        </Box>
      </Flex>
    </Link>
    // </Button>
  );
}

export default Card;
