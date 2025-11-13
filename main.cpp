#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <iostream>
#include <string>
#include <thread>
#include <mutex>
#include <windows.h>
#include <nlohmann/json.hpp>

#include "src/core/CommandDispatcher.hpp"
#include "src/modules/ProcessManager.hpp"

namespace beast     = boost::beast;
namespace websocket = beast::websocket;
namespace net       = boost::asio;
using tcp           = net::ip::tcp;
using json          = nlohmann::json;

static std::mutex cout_mtx;
static CommandDispatcher g_dispatcher;

// Xử lý 1 phiên WS: đọc JSON -> dispatch -> trả JSON
static void do_session(tcp::socket s) {
    try {
        websocket::stream<tcp::socket> ws{std::move(s)};
        ws.accept(); // Handshake

        for (;;) {
            beast::flat_buffer buffer;
            ws.read(buffer);

            const std::string req = beast::buffers_to_string(buffer.data());
            json reply;

            try {
                reply = g_dispatcher.dispatch(json::parse(req));
            } catch (const json::exception& e) {
                reply = {
                    {"status","error"},
                    {"module","CORE"},
                    {"message", std::string("JSON error: ") + e.what()}
                };
            }

            ws.text(true);
            ws.write(net::buffer(reply.dump()));

            std::lock_guard<std::mutex> lk(cout_mtx);
            std::cout << "[REPLY] " << reply.dump() << "\n";
        }
    } catch (const beast::system_error& se) {
        if (se.code() != websocket::error::closed) {
            std::lock_guard<std::mutex> lk(cout_mtx);
            std::cerr << "Beast error: " << se.code().message() << "\n";
        }
    } catch (const std::exception& e) {
        std::lock_guard<std::mutex> lk(cout_mtx);
        std::cerr << "Session error: " << e.what() << "\n";
    }
}

int main() {
    try {
        SetConsoleOutputCP(CP_UTF8);
        // Vô hiệu Ctrl+C để tránh accept() bị ngắt
        SetConsoleCtrlHandler(NULL, TRUE);

        std::cout << "BUILD: " << __DATE__ << " " << __TIME__ << "\n";

        const unsigned short port = 9010; // dùng 9010 cho sạch
       // const auto address       = net::ip::make_address("127.0.0.1");
        auto address = net::ip::make_address("0.0.0.0");
        //auto address = net::ip::make_address("10.29.160.254");
        net::io_context ioc{1};
        tcp::acceptor acceptor{ioc, {address, port}};
        std::cout << "LISTENING ws://0.0.0.0:" << port << "\n";

        g_dispatcher.register_module(std::make_unique<ProcessManager>());
     std::cout << " - PROCESS\n";   
        std::cout << "Module registered:\n";
   
        std::cout << "READY, entering accept loop...\n";

        try {
            for (;;) {
                tcp::socket s{ioc};
                acceptor.accept(s); // block cho tới khi có client
                std::cout << "ACCEPTED from " << s.remote_endpoint() << "\n";
                std::thread(do_session, std::move(s)).detach();
            }
        }
        catch (const boost::system::system_error& e) {
            std::cerr << "[ACCEPT ERROR] code=" << e.code().value()
                      << " (" << e.code().message() << ")\n";
            // Giữ console lại để đọc lỗi
            Sleep(INFINITE);
        }
        catch (const std::exception& e) {
            std::cerr << "[ACCEPT EXCEPTION] " << e.what() << "\n";
            Sleep(INFINITE);
        }

    } catch (const std::exception& e) {
        std::cerr << "Startup error: " << e.what() << "\n";
        return 1;
    }
}
