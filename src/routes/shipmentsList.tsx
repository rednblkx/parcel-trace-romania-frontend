import { Box, Flex, VStack, Stack } from "@chakra-ui/layout";
import localforage from "localforage";
import { Outlet, useLoaderData } from "react-router-dom";
import Card from "../Card";

interface shipmentHistory {
  status: string,
  statusId: number,
  county: string,
  country: string,
  statusDate: string
}

export interface IShipment {
  id: string,
  carrier: number,
  status: string,
  statusId: number,
  createdAt: Date,
  updatedAt: Date,
  history: shipmentHistory[]
}


export async function getShipmentList() {
  let list: IShipment[] | null = await localforage.getItem("shipmentList");
  return list ?? null;
}

function ShipmentsList() {
  let list = useLoaderData() as IShipment[];
  return (
    <>
      <Stack p="2" direction={['column','row']} wrap="wrap" justify="space-around" alignContent="center">
        {list?.map(el => <Card key={el.id} id={el.id} status={el.status} statusId={el.statusId} w={["100%", "max-content"]} maxW={["350px", "250px"]} mb={["0", "5"]} />) || null}
      </Stack>
      {/* <Outlet/> */}
    </>
  )
}

export default ShipmentsList;