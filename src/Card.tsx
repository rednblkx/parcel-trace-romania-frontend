import { Icon } from "@chakra-ui/icon";
import {
  Box,
  Flex,
  LinkBox,
  LinkOverlay,
  Text,
} from "@chakra-ui/layout";
import { useColorMode, FlexProps } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { status_icons } from "./routes/shipment/shipmentDetails";
import { FaArrowRight } from "react-icons/fa";

function Card({ id, status, statusId, ...rest }: {id: string, status: string, statusId: number} & FlexProps) {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    // <Button w="100%" h="100%">
    // <Link to={`shipment/${id}`} style={{height: "fit-content", WebkitTapHighlightColor: 'transparent'}}>
    <LinkBox>
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
        boxSizing="border-box"
        flexDirection="row"
        align={"center"}
        // w={["100%", "max-content"]}
        maxW={["100%", "300px"]}
        mb={["0", "5"]}
      // minW={["100%"]}
        {...rest}
      >
        <Icon as={status_icons[statusId]} w={8} h={8} mr={4} />
        <Box flex="1" noOfLines={1}>
          <Text as="b" textAlign="start" noOfLines={1}>
            {id}
          </Text>
          <Text textAlign="start" mt={2} noOfLines={1}>
            {status}
          </Text>
        </Box>
        <LinkOverlay as={Link} to={`shipment/${id}`} style={{WebkitTapHighlightColor: 'transparent'}}>
          <Flex>
            <Icon as={FaArrowRight} w={8} h={8} ml={4} />
          </Flex>
        </LinkOverlay>
      </Flex>
    </LinkBox>
    // </Link>
    // </Button>
  );
}

export default Card;
