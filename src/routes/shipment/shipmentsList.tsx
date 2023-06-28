import { Stack } from "@chakra-ui/layout";
import { PostgrestResponse } from "@supabase/supabase-js";
import localforage from "localforage";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import Card from "../../Card";
import { IParcelMonitor } from "../../main";
import { supabase } from "../../supabase";
import { Flex, Heading, useColorModeValue } from "@chakra-ui/react";

interface shipmentHistory {
  status: string;
  statusId: number;
  county: string;
  country: string;
  statusDate: string;
  transitLocation: string;
}

export interface IShipment {
  [k: string]: unknown;
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
  let [shipments, setShipments] = useState(list);
  let emptyColorMode = useColorModeValue("#757575", "#888888")
  useEffect(() => {
    setShipments(list);
  }, [list]);
  useEffect(() => {
    (async () => {
      let { data: parcels, error: errorDB } = (await supabase
        .from("parcels_monitoring")
        .select(
          "*, carrier_id ( id, name )"
        )) as PostgrestResponse<IParcelMonitor>;
      if (parcels) {
        var new_list: IShipment[] =
          (await localforage.getItem("shipmentList")) || [];
        for await (const data of parcels) {
          let parcel: IShipment = {
            id: data.tracking_id,
            status: "",
            statusId: 255,
            createdAt: new Date(),
            carrier: data.carrier_id.id,
            carrier_name: data.carrier_id.name,
            updatedAt: new Date(),
            history: [],
          };
          let found_obj = new_list?.find((el) => el.id === data.tracking_id);
          if (found_obj) {
            continue;
          }

          new_list?.push(parcel);
        }
        setShipments(new_list);
        await localforage.setItem("shipmentList", new_list);
      }
    })();
  }, []);
  return (
    <>
      <Stack
        p="2"
        direction={["column", "row"]}
        wrap={["nowrap", "wrap"]}
        justify={[shipments?.length == 0 ? "center" : "unset", "space-around"]}
        alignContent="center"
        flex={shipments?.length == 0 ? 1 : ""}
        pb="4"
      >
        {shipments?.map((el) => (
          <Card
            key={el.id}
            id={el.id}
            status={el.status}
            statusId={el.statusId}
            onTouchStart={(ev) => {ev.preventDefault() ; console.log(ev)}}
          />
        ))}
        {shipments?.length == 0 && (
          <Flex align="center" justify="center">
            <Heading color={emptyColorMode}>No shipments</Heading>
          </Flex>
        )}
      </Stack>
      {/* <Outlet/> */}
    </>
  );
}

export default ShipmentsList;
