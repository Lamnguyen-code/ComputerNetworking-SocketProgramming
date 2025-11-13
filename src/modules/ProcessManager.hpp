// src/modules/ProcessManager.hpp
#pragma once
#include "../interfaces/IRemoteModule.hpp"
#include <string>
#include <windows.h> // Cho các kiểu dữ liệu Windows

class ProcessManager : public IRemoteModule {
private:
    std::string module_name_ = "PROCESS";
    
    // Các hàm thực thi Windows API (Triển khai trong .cpp)
    json list_processes_impl();
    json kill_process_impl(unsigned long pid);
    json start_process_impl(const std::string& path);
    
public:
    ProcessManager() = default;
    const std::string& get_module_name() const override { return module_name_; }

    json handle_command(const json& request) override; // Định nghĩa trong .cpp
};