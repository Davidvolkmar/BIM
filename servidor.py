# Servidor local de la presentación. Le pide al navegador no guardar copias,
# así cada cambio en los archivos se ve al recargar.
import http.server, os, sys

PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 5731
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), SinCache).serve_forever()
