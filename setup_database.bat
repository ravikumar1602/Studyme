@echo off
echo Setting up Study Portal database...

echo Creating database and tables...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS study_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo Importing schema...
mysql -u root study_portal < database\schema.sql

echo Database setup completed!
pause
