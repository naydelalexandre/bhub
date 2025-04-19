import http.server
import socketserver
import webbrowser
from urllib.parse import unquote
import os

# Usar uma porta diferente (3002) já que 3001 pode estar em uso
PORT = 3002
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class DemoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Redirecionar a raiz para demo.html
        if self.path == '/':
            self.path = '/demo.html'
        return super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

handler = DemoHandler

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Servidor demo iniciado em: http://localhost:{PORT}/")
    print(f"Você pode acessar:")
    print(f" - Visão web: http://localhost:{PORT}/demo.html")
    print(f" - Visão mobile: http://localhost:{PORT}/mobile-view.html")
    print("Pressione Ctrl+C para encerrar o servidor")
    
    # Abrir o navegador automaticamente
    webbrowser.open(f"http://localhost:{PORT}/")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado") 