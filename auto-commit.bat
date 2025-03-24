@echo off
echo Checking for changes...

git add .
git commit -m "Auto-commit: Update website content"
git push

if %errorlevel% equ 0 (
    echo Changes successfully committed and pushed
) else (
    echo Error occurred while committing changes
)

pause 