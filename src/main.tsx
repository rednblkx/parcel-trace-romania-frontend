import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import "./index.css";
import ErrorPage from "./error-page";
import ShipmentDetails, {
  getShipment,
} from "./routes/shipment/shipmentDetails";
import { getShipmentList, IShipment } from "./routes/shipment/shipmentsList";
import ShipmentAdd, {
  action as addAction,
  ICarriers,
} from "./routes/shipment/shipmentAdd";
import theme from "./theme";
import {
  createClient,
  PostgrestError,
  PostgrestResponse,
} from "@supabase/supabase-js";
import localforage from "localforage";
import ShipmentRemove from "./routes/shipment/shipmentRemove";
import SignIn from "./routes/auth/signIn";
import SignUp from "./routes/auth/signUp";
import AuthProfile from "./routes/auth/authProfile";
import { AuthProvider, useAuth } from "./Auth";
import { supabase } from "./supabase";

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

export interface IParcelMonitor {
  id: number;
  tracking_id: string;
  carrier_id: {id: number, name: string };
  user_id: string;
  created_at: Date;
  last_updated: Date;
  statusId: number;
}

export interface IParcelMonitorResponse {
  data: IParcelMonitor[];
  error?: PostgrestError | Error | null;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: getShipmentList,
    children: [
      {
        path: "profile",
        element: <AuthProfile />,
        loader: async () => {
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error) console.error(error);
            if (data.user == null) {
              // console.log(data.user);
              return redirect("/auth/login");
            } else {
              let { data: parcels, error: errorDB } = (await supabase
                .from("parcels_monitoring")
                .select(
                  "*, carrier_id ( name )"
                )) as PostgrestResponse<IParcelMonitor>;

              console.log(parcels);
              let res: IParcelMonitorResponse = {
                data: parcels ?? [],
                error: errorDB,
              };
              return res;
            }
            // if (error != null) {
            //   throw error
            // }
          } catch (error: any) {
            console.error(error);
            let res: IParcelMonitorResponse = {
              data: [],
              error: error?.message || new Error(error),
            };
            return res;
          }
        },
      },
      {
        path: "auth/login",
        element: <SignIn />,
        loader: async () => {
          try {
            const { data, error } = await supabase.auth.getUser();
            console.error(error);
            if (data.user != null) {
              // console.log(data.user);
              return redirect("/profile");
            }
            // if (error != null) {
            //   throw error
            // }
          } catch (error) {
            console.error(error);
          }
        },
      },
      {
        path: "auth/logout",
        loader: async () => {
          try {
            await supabase.auth.signOut();
            return redirect("/auth/login");
          } catch (error) {
            console.error(error);
          }
        },
      },
      {
        path: "shipment/add",
        element: <ShipmentAdd />,
        action: addAction,
        loader: async () => {
          try {
            let carriers_local = await localforage.getItem<ICarriers[]>(
              "carriers"
            );
            // if (!carriers_local) {
            let { data: carriers, error } = (await supabase
              .from("carriers")
              .select("*")) as PostgrestResponse<ICarriers>;

            await localforage.setItem<ICarriers[] | null>("carriers", carriers);
            if (carriers_local !== carriers && carriers !== null) {
              carriers_local = carriers;
              await localforage.setItem<ICarriers[] | null>(
                "carriers",
                carriers
              );
            }
            // }
            return { data: carriers_local, error };
          } catch (error: any) {
            return {
              data: null,
              error: error?.message ?? new Error(error),
            };
          }
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
            return "Shipment finalised";
          }
          if (diffsMinutes < 30 && list[parcel].history?.length > 0) {
            console.log(
              `too early for update, last update ${diffsMinutes} minute ago`
            );

            return `too early for update, last update ${diffsMinutes} minute ago`;
          }

          if (parcel === -1) return { error: "AWB not found" };

          try {
            const { data: api_res, error } = await supabase.functions.invoke(
              "trace-parcel",
              {
                body: {
                  carrier_id: list[parcel].carrier,
                  tracking_id: list[parcel].id,
                },
              }
            );

            if (api_res === null && error) {
              throw error;
            }

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
  <AuthProvider>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <RouterProvider router={router} />
    </ChakraProvider>
  </AuthProvider>
  // </React.StrictMode>
);
