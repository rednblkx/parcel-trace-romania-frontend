import { createClient } from '@supabase/supabase-js'
import webpush from "web-push"
// import axios from "axios"

const publicVapidKey = 'BMBXR2-2GL2qPY7u-w6ICu3vmzJPa89M_63e35-DZvycuVQsHs4FPzwLB6AsV0spANBpoVYz1UzJLOrNHe0z_Hg';
const privateVapidKey = process.env.VITE_PRIVATE_VAPID_KEY;
webpush.setVapidDetails('mailto:rednblkx@kodeeater.xyz', publicVapidKey, privateVapidKey || "");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    res.send("OK")
  }

  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL || "", process.env.VITE_SUPABASE_SERVICE_KEY || "")

    const { data: parcels, error } = await supabase.rpc("get_parcels_monitoring");

    if (error) {
      throw error
    }
    let promises = parcels.map(obj => supabase.functions.invoke("trace-parcel", { body: { tracking_id: obj.tracking_id, carrier_id: obj.carrier.id } }));
    if (parcels && parcels.length > 0) {
      await Promise.all(promises).then(async result => {
        let notifications = []
        for (const data of result) {
          try {
            let shipment = parcels.find(a => a.tracking_id.includes(data.data.awbNumber));
            if (data.data && shipment.count_events < data?.data?.eventsHistory.length) {
              // const { data: dataS, error } = await supabase.from("subscriptions").select("*").eq("user_id", shipment.user_id)
              for (const sub of shipment.subscriptions) {
                notifications.push({ sub, data: { carrier: shipment.carrier.name, tracking_id: shipment.tracking_id, status: data.data.status, county: data?.data?.eventsHistory[0].county } })
              }
              // axios.post(`https://ntfy.kodeeater.xyz/parcel-romania-${shipment.user_id.slice(0, 8)}`, `${shipment.carrier_id.name} \n ${shipment.tracking_id} - ${data?.data.status}, ${data?.data.eventsHistory[0].county}`)
              if (data.data.statusId == 99 || data.data.statusId == 255) {
                const { error: errorL } = await supabase.from("parcels_monitoring").delete().eq("tracking_id", shipment.tracking_id)
                if (errorL) {
                  console.log(errorL);
                }
                for (const sub of shipment.subscriptions) {
                  notifications.push({ sub, data: { carrier: shipment.carrier.name, tracking_id: shipment.tracking_id, status: "Parcel delivered, removed from watching list!", county: "" } })
                }
              } else {
                const { error: errorL } = await supabase.from("parcels_monitoring").update({ statusId: data?.data?.statusId, last_updated: new Date(), last_checked: new Date(), count_events: data?.data.eventsHistory.length }).eq("tracking_id", shipment.tracking_id)
                if (errorL) {
                  console.log(errorL);
                }
              }
            } else {
              if (((new Date() - new Date(shipment.last_updated).getTime()) / (1000 * 3600 * 24)).toFixed(0) > 10) {
                for (const sub of shipment.subscriptions) {
                  notifications.push({sub, data: {carrier: shipment.carrier.name, tracking_id: shipment.tracking_id, status: "No updates in 10 days, removed from the watching list!", county: ""}})
                }
                const { error: errorL } = await supabase.from("parcels_monitoring").delete().eq("tracking_id", shipment.tracking_id)
                if (errorL) {
                  console.log(errorL);
                }
              } else {
                if (data.data.statusId == 99 || data.data.statusId == 255) {
                  const { error: errorL } = await supabase.from("parcels_monitoring").delete().eq("tracking_id", shipment.tracking_id)
                  if (errorL) {
                    console.log(errorL);
                  }
                  for (const sub of shipment.subscriptions) {
                    notifications.push({ sub, data: { carrier: shipment.carrier.name, tracking_id: shipment.tracking_id, status: "Parcel delivered, removed from watching list!", county: "" } })
                  }
                } else {
                  const { error: errorCheck } = await supabase.from("parcels_monitoring").update({ last_checked: new Date() }).eq("tracking_id", shipment.tracking_id)
                  if (errorCheck) {
                    console.log(errorCheck);
                  }
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
        return notifications
      }).then(async a => {
        console.log(a.length);
        await Promise.all(a.map(b => webpush.sendNotification(b.sub, JSON.stringify(b.data))))
      }).catch(err => {
        console.error(err);
      })
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    res.status(200).json(
      parcels
    )
  } catch (error) {
    console.log(error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    res.status(400).json(
      { error: error.message }
    )
  }

}
