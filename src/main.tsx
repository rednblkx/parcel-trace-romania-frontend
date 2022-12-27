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
import ShipmentDetails, { getShipment } from "./routes/shipment/shipmentDetails";
import {
  getShipmentList,
  IShipment,
} from "./routes/shipment/shipmentsList";
import ShipmentAdd, {
  action as addAction,
  carriers,
} from "./routes/shipment/shipmentAdd";
import theme from "./theme";
import { createClient, PostgrestResponse } from "@supabase/supabase-js";
import localforage from "localforage";
import ShipmentRemove from "./routes/shipment/shipmentRemove";
import SignIn from "./routes/auth/signIn";
import SignUp from "./routes/auth/signUp";
import AuthProfile from "./routes/auth/authProfile";

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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
            console.error(error)
            if (data.user == null) {
              console.log(data.user);
              return redirect("/auth/login")
            } else return data.user
            // if (error != null) {
            //   throw error
            // }
          } catch (error) {
            console.error(error)
          }
        }
      },
      {
        path: "auth/login",
        element: <SignIn />,
        loader: async () => {
          try {
            const { data, error } = await supabase.auth.getUser();
            console.error(error)
            if (data.user != null) {
              // console.log(data.user);
              return redirect("/profile")
            }
            // if (error != null) {
            //   throw error
            // }
          } catch (error) {
            console.error(error)
          }
        }
      },
      {
        path: "auth/signup",
        element: <SignUp/>
      },
      {
        path: "shipment/add",
        element: <ShipmentAdd />,
        action: addAction,
        loader: async () => {
          let carriers_local = await localforage.getItem<carriers[]>(
            "carriers"
          );
          // if (!carriers_local) {
          let { data: carriers, error } = (await supabase
            .from("carriers")
            .select("*")) as PostgrestResponse<carriers>;
          await localforage.setItem<carriers[] | null>("carriers", carriers);
          if (carriers_local !== carriers && carriers !== null) {
            carriers_local = carriers;
            await localforage.setItem<carriers[] | null>("carriers", carriers);
          }
          // }
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
            const { data: api_res, error } = await supabase.functions.invoke('trace-parcel', {
              body: {
                carrier_id: list[parcel].carrier,
                tracking_id: list[parcel].id,
              }
            })

            if (api_res === null && error) {
              throw error
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
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <RouterProvider router={router} />
  </ChakraProvider>
  // </React.StrictMode>
);
