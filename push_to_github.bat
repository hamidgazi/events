@echo off
title Sync Events App to GitHub
echo ========================================================
echo   Events Countdown - Syncing to GitHub (hamidgazi/events)
echo ========================================================
echo.

cd /d "%~dp0"

echo Copying events.html to index.html...
copy /y events.html index.html >nul

echo Staging files...
git add index.html events.html version.json manifest.json sw.js icon.svg icon-192.png icon-512.png .gitignore

echo Creating commit...
git commit -m "Update Events Countdown app" 2>nul
if %errorlevel% neq 0 (
  echo No new changes to commit, or commit already created.
)

echo Pushing to GitHub...
git push -u origin main

echo.
if %errorlevel% equ 0 (
  echo ========================================================
  echo  [SUCCESS] Successfully pushed to GitHub!
  echo  Live App URL: https://hamidgazi.github.io/events/
  echo ========================================================
) else (
  echo ========================================================
  echo  [ACTION REQUIRED]
  echo  If this is your first time, please check your network
  echo  or authorize Git to access your GitHub account.
  echo ========================================================
)

echo.
pause
