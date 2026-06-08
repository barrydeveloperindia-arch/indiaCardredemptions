import socket
import urllib.request
import json
import base64
import hashlib
import struct

def get_ws_url():
    try:
        req = urllib.request.urlopen("http://127.0.0.1:9222/json", timeout=5)
        targets = json.loads(req.read().decode('utf-8'))
        for t in targets:
            # We can use any target's WS URL
            if 'webSocketDebuggerUrl' in t:
                return t['webSocketDebuggerUrl']
    except Exception as e:
        print(f"Error getting targets: {e}")
    # Fallback to browser WS URL
    return "ws://127.0.0.1:9222/devtools/browser"

def parse_ws_url(url):
    # e.g. ws://127.0.0.1:9222/devtools/page/DD65...
    url = url.replace("ws://", "")
    host_port, path = url.split("/", 1)
    host, port = host_port.split(":")
    return host, int(port), "/" + path

def ws_handshake(s, host, port, path):
    key = base64.b64encode(b"any-random-key-16-bytes").decode('utf-8')
    handshake = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}:{port}\r\n"
        f"Upgrade: websocket\r\n"
        f"Connection: Upgrade\r\n"
        f"Sec-WebSocket-Key: {key}\r\n"
        f"Sec-WebSocket-Version: 13\r\n\r\n"
    )
    s.sendall(handshake.encode('utf-8'))
    resp = b""
    while b"\r\n\r\n" not in resp:
        resp += s.recv(1024)
    print("Handshake response received.")

def make_ws_frame(message):
    payload = message.encode('utf-8')
    payload_len = len(payload)
    
    # FIN = 1, Opcode = 1 (Text)
    header = bytearray([0x81])
    
    # Mask key is required for client-to-server frames
    mask_key = b"\x11\x22\x33\x44"
    
    if payload_len <= 125:
        header.append(payload_len | 0x80)
    elif payload_len <= 65535:
        header.append(126 | 0x80)
        header.extend(struct.pack("!H", payload_len))
    else:
        header.append(127 | 0x80)
        header.extend(struct.pack("!Q", payload_len))
        
    header.extend(mask_key)
    
    # Mask the payload
    masked_payload = bytearray(
        payload[i] ^ mask_key[i % 4] for i in range(payload_len)
    )
    
    return header + masked_payload

def read_ws_frame(s):
    # Read first two bytes
    data = s.recv(2)
    if not data or len(data) < 2:
        return None
    
    opcode = data[0] & 0x0F
    masked = data[1] & 0x80
    payload_len = data[1] & 0x7F
    
    if payload_len == 126:
        payload_len = struct.unpack("!H", s.recv(2))[0]
    elif payload_len == 127:
        payload_len = struct.unpack("!Q", s.recv(8))[0]
        
    if masked:
        mask_key = s.recv(4)
        
    payload = s.recv(payload_len)
    while len(payload) < payload_len:
        payload += s.recv(payload_len - len(payload))
        
    if masked:
        unmasked = bytearray(
            payload[i] ^ mask_key[i % 4] for i in range(payload_len)
        )
        return unmasked.decode('utf-8')
    else:
        return payload.decode('utf-8')

def send_cdp_command(s, method, params):
    cmd = {
        "id": 1,
        "method": method,
        "params": params
    }
    msg = json.dumps(cmd)
    print(f"Sending: {msg}")
    frame = make_ws_frame(msg)
    s.sendall(frame)
    
    # Wait for response
    resp = read_ws_frame(s)
    print(f"Received: {resp}")
    return resp

def main():
    ws_url = get_ws_url()
    print(f"Using WS URL: {ws_url}")
    host, port, path = parse_ws_url(ws_url)
    
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    ws_handshake(s, host, port, path)
    
    # Open new tab for http://localhost:8081
    print("\nCreating new tab...")
    send_cdp_command(s, "Target.createTarget", {"url": "http://localhost:8081"})
    
    s.close()

if __name__ == "__main__":
    main()
