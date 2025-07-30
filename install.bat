@echo off
echo Installing iHost Dependencies...

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Installing Backend Dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..
echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Copy .env.example to .env and configure your credentials
echo 2. Set up your Supabase project and run the SQL scripts
echo 3. Run 'start-dev.bat' to start the development servers
echo.
pause
