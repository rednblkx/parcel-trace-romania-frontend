import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  redirect,
} from "react-router-dom";
import "./index.css";
import ErrorPage from "./error-page";
import ShipmentDetails, { getShipment } from "./routes/shipmentDetails";
import ShipmentsList, {
  getShipmentList,
  IShipment,
} from "./routes/shipmentsList";
import ShipmentAdd, {
  action as addAction,
  carriers,
} from "./routes/shipmentAdd";
import theme from "./theme";
import { createClient, PostgrestResponse } from "@supabase/supabase-js";
import localforage from "localforage";
import ShipmentRemove from "./routes/shipmentRemove";

interface IEventsHistory {
  status: string;
  statusId: number;
  county: string;
  country: string;
  statusDate: string;
}

export interface IRes {
  awbNumber: string;
  status: string;
  statusId: number;
  eventsHistory: IEventsHistory[];
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: getShipmentList,
    children: [
      {
        path: "shipment/add",
        element: <ShipmentAdd />,
        action: addAction,
        loader: async () => {
          let carriers_local = await localforage.getItem<carriers[]>(
            "carriers"
          );
          if (!carriers_local) {
            const supabaseUrl = "https://ebdhdneueqnvpgmgcjvl.supabase.co";
            const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
            const supabase = createClient<
              carriers,
              "id" | "name" | "created_at" | "active",
              any
            >(supabaseUrl, supabaseKey);
            let { data: carriers, error } = (await supabase
              .from("carriers")
              .select("*")) as PostgrestResponse<carriers>;
            await localforage.setItem<carriers[] | null>("carriers", carriers);
            return carriers;
          }
          return carriers_local;
        },
      },
      {
        path: "shipment/:trackingid",
        element: <ShipmentDetails />,
        action: async ({ params }) => {
          let list: IShipment[] = (await localforage.getItem(
            "shipmentList"
          )) as IShipment[];
          let parcel: number = list.findIndex(
            (el) => el.id === params.trackingid
          );
          let diffsMillis =
            new Date().getTime() - new Date(list[parcel].updatedAt).getTime();

          let diffsMinutes = Math.round(diffsMillis / 60000);

          if (list[parcel].statusId == 99) {
            console.log("Shipment finalised");
            return "Shipment finalised"
          }
          if (diffsMinutes < 30 && list[parcel].history?.length > 0) {
            console.log(`too early for update, last update ${diffsMinutes} minute ago`);

            return `too early for update, last update ${diffsMinutes} minute ago`;
          }

          if (parcel === -1) return { error: "AWB not found" };

          try {
            let api_res: IRes = await (
              await fetch(import.meta.env.VITE_SUPABASE_FUNCTIONS_URI, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  // 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`
                },
                body: JSON.stringify({
                  carrier_id: list[parcel].carrier,
                  tracking_id: list[parcel].id,
                }),
              })
            ).json();

            let new_status: IShipment = {
              ...list[parcel],
              status: api_res.status,
              statusId: api_res.statusId,
              history: api_res.eventsHistory,
              updatedAt: new Date(),
            };

            list[parcel] = new_status;

            await localforage.setItem("shipmentList", list);

            return new_status;
          } catch (error) {
            console.log(error);
          }
        },
        loader: ({ params }: any) => getShipment(params.trackingid),
        children: [
          {
            path: "remove",
            element: <ShipmentRemove />,
            action: async ({ params }) => {
              let list: IShipment[] | null = await localforage.getItem(
                "shipmentList"
              );

              let parcel = list?.filter((el) => el.id !== params.trackingid);

              await localforage.setItem("shipmentList", parcel);

              return redirect("/");
            },
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <RouterProvider router={router} />
  </ChakraProvider>
  // </React.StrictMode>
);
