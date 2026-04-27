@echo off
echo Compiling Java classes...
if not exist bin mkdir bin
javac -d bin src\bankmanagement\*.java
if %errorlevel% neq 0 (
    echo Compilation failed.
    pause
    exit /b %errorlevel%
)
echo Compilation successful. Starting Bank Management System...
echo ========================================================
java -cp bin bankmanagement.Main
pause
