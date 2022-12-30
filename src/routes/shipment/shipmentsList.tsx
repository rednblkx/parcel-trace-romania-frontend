import {
  Stack
} from "@chakra-ui/layout";
import localforage from "localforage";
import { useLoaderData } from "react-router-dom";
import Card from "../../Card";

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
  carrier_name: string | undefined;
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

function ShipmentsList() {
  let list = useLoaderData() as IShipment[];
  return (
    <>
      <Stack
        p="2"
        direction={["column", "row"]}
        wrap={["nowrap", "wrap"]}
        justify={["unset","space-around"]}
        alignContent="center"
        h="calc(100dvh - var(--chakra-sizes-14))"
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
