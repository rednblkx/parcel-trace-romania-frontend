// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from '@supabase/supabase-js'
import webpush from "web-push"
import axios from "axios"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
//storing the keys in variables
const publicVapidKey = 'BMBXR2-2GL2qPY7u-w6ICu3vmzJPa89M_63e35-DZvycuVQsHs4FPzwLB6AsV0spANBpoVYz1UzJLOrNHe0z_Hg';
const privateVapidKey = process.env.VITE_PRIVATE_VAPID_KEY;
webpush.setVapidDetails('mailto:rednblkx@kodeeater.xyz', publicVapidKey, privateVapidKey || "");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // const { name } = await req.json()
    const supabase = createClient(process.env.VITE_SUPABASE_URL || "", process.env.VITE_SUPABASE_SERVICE_KEY || "")
    const thirtyMinutesBefore = new Date();
    thirtyMinutesBefore.setMinutes(thirtyMinutesBefore.getMinutes() - 30);
    
    const {data: parcels, error} = await supabase.from("parcels_monitoring").select("tracking_id, carrier_id(id, name), user_id, count_events").lte( "last_updated", thirtyMinutesBefore.toISOString())
    
    if (error) {
      throw error
    }
    let promises = parcels.map(obj => supabase.functions.invoke("trace-parcel", { body: { tracking_id: obj.tracking_id, carrier_id: obj.carrier_id.id } }));
    if (parcels && parcels.length > 0) {
      await Promise.all(promises).then(async result => {
        let notifications = []
        for (const data of result) {
          let shipment = parcels.find(a => a.tracking_id.includes(data.data.awbNumber));
        // const { error: errorI } = await supabase.from("parcels_monitoring").update({ statusId: data?.data?.statusId, last_updated: new Date() }).eq("tracking_id", shipment.tracking_id)
        // if (errorI) {
        //   console.log(errorI);
        // }
        if (data.data && shipment.count_events < data?.data?.eventsHistory.length) {
          const { data: dataS, error } = await supabase.from("subscriptions").select("*").eq("user_id", shipment.user_id)
          for (const sub of dataS) {
            notifications.push({sub, data: {carrier: shipment.carrier_id.name, tracking_id: shipment.tracking_id, status: data.data.status, county: data?.data?.eventsHistory[0].county}})
          }
          // axios.post(`https://ntfy.kodeeater.xyz/parcel-romania-${shipment.user_id.slice(0, 8)}`, `${shipment.carrier_id.name} \n ${shipment.tracking_id} - ${data?.data.status}, ${data?.data.eventsHistory[0].county}`)
          if (data.data.statusId == 99 || data.data.statusId == 255) {
            // const { error: errorL } = await supabase.from("parcels_monitoring").delete().eq("tracking_id", shipment.tracking_id)
            // if (errorL) {
            //   console.log(errorL);
            // }
          } else {
            const { error: errorL } = await supabase.from("parcels_monitoring").update({statusId: data?.data?.statusId, last_updated: new Date(), count_events: data?.data.eventsHistory.length }).eq("tracking_id", shipment.tracking_id)
            if (errorL) {
              console.log(errorL);
            }
          }
        }
        }
        return notifications
      }).then(async a => {
        console.log(a.length);
          await Promise.all(a.map(b => webpush.sendNotification(b.sub, JSON.stringify(b.data))))
      })
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.status(200).json(
      parcels
    )
  } catch (error) {
    console.log(error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.status(400).json(
      { error: error.message }
    )
  }

}
