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
const os = require("os");

const server = dgram.createSocket("udp4");

// Hàm lấy IP LAN của Registry server
function getLocalIp() {
    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Lấy IPv4 và không phải 127.0.0.1
            if (net.family === "IPv4" && !net.internal) {
                return net.address;
            }
        }
    }
    return "127.0.0.1"; 
}

const REGISTRY_IP = getLocalIp();

server.on("listening", () => {
    console.log(`[UDP] Discovery server listening on 0.0.0.0:8888`);
    console.log(`[UDP] Registry IP = ${REGISTRY_IP}`);
});

server.on("message", (msg, rinfo) => {
    console.log(`[UDP] Message from ${rinfo.address}:`, msg.toString());

    if (msg.toString() === "DISCOVER_REGISTRY") {
        const reply = "REGISTRY_IP:" + REGISTRY_IP;
        server.send(reply, rinfo.port, rinfo.address);
        console.log(`[UDP] Sent: ${reply} → to ${rinfo.address}:${rinfo.port}`);
    }
});

server.bind(8888, "0.0.0.0");

