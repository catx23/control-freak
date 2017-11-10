@ECHO OFF
:: Kill all these processes
taskkill /f /IM nginx-windows.exe
taskkill /f /im mongod-windows.exe
taskkill /f /im server.exe
EXIT