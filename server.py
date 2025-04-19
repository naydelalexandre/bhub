import http.server
import socketserver

PORT = 3001
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

handler = Handler

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print("\n=================================================")
    print("     B.Hub - Servidor de Demonstração     ")
    print("=================================================\n")
    print(f"Servidor iniciado com sucesso na porta {PORT}")
    print(f"Para visualizar, acesse: http://localhost:{PORT}/demo.html")
    print("\nPressione Ctrl+C para encerrar o servidor\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado com sucesso") 