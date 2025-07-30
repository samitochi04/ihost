@echo off
echo Starting iHost Development Servers...

echo.
echo Starting Backend Server...
start "iHost Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "iHost Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will keep running)
pause >nul
