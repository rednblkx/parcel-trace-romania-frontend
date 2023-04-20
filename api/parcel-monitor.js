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
    
    const {data, error} = await supabase.from("parcels_monitoring").select("tracking_id, carrier_id(id, name), user_id, count_events").lte( "last_updated", thirtyMinutesBefore.toISOString())
    
    if (error) {
      throw error
    }
    
    if (data && data.length > 0) {
      for await (const el of data) {
        // console.log(el);
        const { data: dataF, error } = await supabase.functions.invoke("trace-parcel", { body: { tracking_id: el.tracking_id, carrier_id: el.carrier_id.id } })
        error && console.log(error);
        const { error: errorI } = await supabase.from("parcels_monitoring").update({ statusId: dataF?.statusId, last_updated: new Date() }).eq("tracking_id", el.tracking_id)
        if (errorI) {
          console.log(errorI);
        }
        if (dataF && el.count_events < dataF?.eventsHistory.length) {
          const { data: dataS, error } = await supabase.from("subscriptions").select("*").eq("user_id", el.user_id)
          for (const sub of dataS) {
            await webpush.sendNotification(sub, JSON.stringify({carrier: el.carrier_id.name, tracking_id: el.tracking_id, status: dataF.status, county: dataF?.eventsHistory[0].county})).catch((err) => console.error(err));
          }
          await axios.post(`https://ntfy.kodeeater.xyz/parcel-romania-${el.user_id.slice(0, 8)}`, `${el.carrier_id.name} \n ${el.tracking_id} - ${dataF?.status}, ${dataF?.eventsHistory[0].county}`)
          if (dataF.statusId == 99 || dataF.statusId == 255) {
            const { error: errorL } = await supabase.from("parcels_monitoring").delete().eq("tracking_id", el.tracking_id)
            if (errorL) {
              console.log(errorL);
            }
          } else {
            const { error: errorL } = await supabase.from("parcels_monitoring").update({ count_events: dataF?.eventsHistory.length }).eq("tracking_id", el.tracking_id)
            if (errorL) {
              console.log(errorL);
            }
          }
        }
        // console.log(res.data);
        // await timeout(1000)
      }
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    res.status(200).json(
      data
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
