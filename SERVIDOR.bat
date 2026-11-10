@echo off
rem Abre la presentacion con un servidor local en el puerto 5731, sin cache.
rem Si no tienes Python, usa INICIAR.bat: funciona igual desde el archivo.
cd /d "%~dp0"
start "" http://localhost:5731/
python servidor.py 5731
