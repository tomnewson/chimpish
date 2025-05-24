#!/usr/bin/env python3
"""
Simple web server to serve the Chimpish Translator interface
and handle translation requests via the chimpish.py script.
"""

import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import chimpish

class ChimpishHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/translate':
            self.handle_translate()
        else:
            self.send_error(404)

    def handle_translate(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            text = data.get('text', '').strip()
            mode = data.get('mode', 'encode')

            if not text:
                self.send_json_response({
                    'success': False,
                    'error': 'No text provided'
                })
                return

            try:
                if mode == 'encode':
                    result = chimpish.encode(text)
                elif mode == 'decode':
                    result = chimpish.decode(text)
                else:
                    raise ValueError(f"Invalid mode: {mode}")

                self.send_json_response({
                    'success': True,
                    'translation': result
                })

            except KeyError as e:
                self.send_json_response({
                    'success': False,
                    'error': f"Unsupported character or symbol: {str(e)}"
                })
            except Exception as e:
                self.send_json_response({
                    'success': False,
                    'error': str(e)
                })

        except json.JSONDecodeError:
            self.send_json_response({
                'success': False,
                'error': 'Invalid JSON data'
            })
        except Exception as e:
            self.send_json_response({
                'success': False,
                'error': f'Server error: {str(e)}'
            })

    def send_json_response(self, data):
        response = json.dumps(data).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(response)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        self.wfile.write(response)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def main():
    port = 8000
    server_address = ('', port)

    # Change to the directory containing the files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    httpd = HTTPServer(server_address, ChimpishHandler)

    print(f"Chimpish Translator server starting...")
    print(f"Open your browser and go to: http://localhost:{port}")
    print("Press Ctrl+C to stop the server")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == "__main__":
    main()
