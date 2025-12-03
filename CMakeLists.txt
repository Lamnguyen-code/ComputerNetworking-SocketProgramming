# cmake_minimum_required(VERSION 3.10)
# project(RemoteControlTool LANGUAGES CXX)

# # C++17
# set(CMAKE_CXX_STANDARD 17)
# set(CMAKE_CXX_STANDARD_REQUIRED ON)

# # ---- Dependencies (vcpkg toolchain đã bật trong VS) ----
# find_package(Boost REQUIRED COMPONENTS system)      # Beast là header-only, chỉ cần system
# find_package(nlohmann_json CONFIG REQUIRED)

# # ---- Sources ----
# set(SERVER_SOURCES
#     main.cpp                                   # main ở THƯ MỤC GỐC
#     src/modules/ProcessManager_win.cpp
#     src/modules/SystemManager_win.cpp
#     src/modules/ScreenManager_win.cpp
#     src/modules/AppManager_win.cpp
#     src/modules/KeyManager_win.cpp
#     src/modules/WebcamManager_win.cpp        # thêm webcam manager
#     # thêm các .cpp khác nếu có
# )

# add_executable(server ${SERVER_SOURCES})

# # Đưa "src" vào include path để #include "interfaces/IRemoteModule.hpp" hoạt động
# target_include_directories(server PRIVATE
#     ${CMAKE_CURRENT_SOURCE_DIR}/src
# )

# # (tùy chọn) macro bạn dùng
# target_compile_definitions(server PRIVATE
#     WIN32_LEAN_AND_MEAN
#     # ASIO_STANDALONE  # bật nếu code yêu cầu
# )

# # Link thư viện
# target_link_libraries(server PRIVATE
#     Boost::system
#     nlohmann_json::nlohmann_json
#     ws2_32
#     user32
#     advapi32
#     # mf              # <--- [THÊM] Media Foundation
#     # mfplat          # <--- [THÊM]
#     # mfreadwrite     # <--- [THÊM]
#     # mfuuid          # <--- [THÊM]
#     # shlwapi         # <--- [THÊM] (Cho thao tác file path)
#     # ole32           # <--- [THÊM] (Cho CoInitialize)
# )
cmake_minimum_required(VERSION 3.10)
project(RemoteControlTool LANGUAGES CXX)

# ---- C++17 ----
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---- ÉP STATIC RUNTIME (CỜ MẠNH NHẤT) ----
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
add_compile_options(/MT$<$<CONFIG:Debug>:d>)

# ---- Build static library ----
set(BUILD_SHARED_LIBS OFF)

# ---- Tìm package của vcpkg (static triplet) ----
find_package(Boost REQUIRED COMPONENTS system)
find_package(nlohmann_json CONFIG REQUIRED)

# ---- Source ----
set(SERVER_SOURCES
    main.cpp
    src/modules/ProcessManager_win.cpp
    src/modules/SystemManager_win.cpp
    src/modules/ScreenManager_win.cpp
    src/modules/AppManager_win.cpp
    src/modules/KeyManager_win.cpp
    src/modules/WebcamManager_win.cpp
)

add_executable(server ${SERVER_SOURCES})

target_include_directories(server PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_compile_definitions(server PRIVATE
    WIN32_LEAN_AND_MEAN
)

# ---- Link libs ----
target_link_libraries(server PRIVATE
    Boost::system
    nlohmann_json::nlohmann_json
    ws2_32
    user32
    advapi32
    shlwapi
    ole32
    mf
    mfplat
    mfreadwrite
    mfuuid
    gdiplus
)
