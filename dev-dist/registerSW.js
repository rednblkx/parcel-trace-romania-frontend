
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/dev-sw.js?dev-sw', { scope: '/', type: 'module' })
//   .then(a => 
//   Notification.requestPermission().then(res=>{
//     if(Notification.permission=='granted'){
//         console.log("Granted permission")
//         return
//     }
//     console.log(res)
// }))