import {
  Box,
  Flex,
  VStack,
  Stack,
  Heading,
  Text,
  SimpleGrid,
} from "@chakra-ui/layout";
import localforage from "localforage";
import { Outlet, useLoaderData } from "react-router-dom";
import Card from "../Card";
import { useRef } from "react";
import { Button, CardBody, CardFooter, Icon } from "@chakra-ui/react";
import { FaWarehouse } from "react-icons/fa";

interface shipmentHistory {
  status: string;
  statusId: number;
  county: string;
  country: string;
  statusDate: string;
}

export interface IShipment {
  id: string;
  carrier: number;
  status: string;
  statusId: number;
  createdAt: Date;
  updatedAt: Date;
  history: shipmentHistory[];
}

export async function getShipmentList() {
  let list: IShipment[] | null = await localforage.getItem("shipmentList");
  return list ?? null;
}

function ShipmentsList({ ...atr }) {
  let list = useLoaderData() as IShipment[];
  return (
    <>
      <Stack
        p="2"
        direction={["column", "row"]}
        wrap="wrap"
        justify="space-around"
        alignContent="center"
        {...atr}
      >
        {list?.map((el) => (
          <Card
            key={el.id}
            id={el.id}
            status={el.status}
            statusId={el.statusId}
          />
        )) || null}
      </Stack>
      {/* <Outlet/> */}
    </>
  );
}

export default ShipmentsList;
