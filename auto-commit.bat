<<<<<<< HEAD
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

=======
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

>>>>>>> 35db824aabac019eb3c9fd58733346f72117a18b
pause 