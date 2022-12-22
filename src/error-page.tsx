import { Center, Code, Flex, Heading, Text, Wrap, WrapItem } from "@chakra-ui/layout";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error : any = useRouteError();
  console.error(error);

  return (
    <Flex direction={"column"} align="center" justify="center" w="100vw" h="100vh">
      <Heading>Oops!</Heading>
      <Text>Sorry, an unexpected error has occurred.</Text>
      <Text as="i">
        Technical details: <Code>{error.statusText || error.message}</Code>
      </Text>
    </Flex>
  );
}