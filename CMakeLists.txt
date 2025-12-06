cmake_minimum_required(VERSION 3.10)
project(RemoteControlTool LANGUAGES CXX)

# ---- C++17 ----
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---- [QUAN TRỌNG] ÉP STATIC RUNTIME (/MT) ----
# Giúp file .exe chạy được trên máy khác mà không cần cài Visual C++ Redistributable
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
add_compile_options(/MT$<$<CONFIG:Debug>:d>)

# ---- Build static library (để tránh phụ thuộc DLL ngoài) ----
set(BUILD_SHARED_LIBS OFF)

# ---- Tìm package (vcpkg) ----
find_package(Boost REQUIRED COMPONENTS system)
find_package(nlohmann_json CONFIG REQUIRED)

# ---- Source Files ----
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

# ---- Include Path ----
target_include_directories(server PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# ---- Compile Definitions ----
target_compile_definitions(server PRIVATE
    WIN32_LEAN_AND_MEAN
)

# ---- Link Libraries (Thư viện liên kết) ----
target_link_libraries(server PRIVATE
    Boost::system
    nlohmann_json::nlohmann_json
    ws2_32
    user32
    advapi32
    shlwapi        # Cần cho xử lý đường dẫn file
    ole32          # Cần cho COM (CoInitialize)
    mf             # Cần cho Webcam (Media Foundation)
    mfplat         # Cần cho Webcam
    mfreadwrite    # Cần cho Webcam
    mfuuid         # Cần cho Webcam
    gdiplus        # Cần cho Screenshot (lưu ảnh JPEG/PNG)
)