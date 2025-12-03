// const dgram = require("dgram");
// const server = dgram.createSocket("udp4");

// server.on("listening", () => {
//     const address = server.address();
//     console.log(`[UDP] Discovery server listening on ${address.address}:${address.port}`);
// });

// server.on("message", (msg, rinfo) => {
//     const text = msg.toString();

//     console.log(`[UDP] Message from ${rinfo.address}:`, text);

//     if (text === "DISCOVER_REGISTRY") {
//         const response = `REGISTRY_IP:${rinfo.address}`;
//         server.send(response, rinfo.port, rinfo.address);
//         console.log("[UDP] Sent:", response);
//     }
// });

// // Lắng nghe UDP 8888
// server.bind(8888);
const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("listening", () => {
    console.log("[UDP] Discovery server listening on 0.0.0.0:8888");
});

server.on("message", (msg, rinfo) => {
    console.log("[UDP] Message from", rinfo.address + ":", msg.toString());

    server.send("REGISTRY_IP:" + rinfo.address, rinfo.port, rinfo.address);
});

server.bind(8888, "0.0.0.0");
