all:
	@g++ main.cpp src/modules/*_linux.cpp -o main.exe && sudo ./main.exe

run:
	sudo ./main.exe
