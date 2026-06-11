@echo off
echo [1/5] Initializing Git repository...
git init

echo [2/5] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/yoonjae0707/SeoulDistrictHub.git

echo [3/5] Staging all files...
git add .

echo [4/5] Configuring Git identity & Creating initial commit...
git config user.email "yoonjae0707@users.noreply.github.com"
git config user.name "yoonjae0707"
git commit -m "feat: Samsung One UI 8.5 capsule design, inline SVG widgets, and seoul map self-healing fix"

echo [5/5] Pushing to main branch...
git branch -M main
git push -u origin main

echo Done!
pause
