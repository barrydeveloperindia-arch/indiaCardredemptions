import socket
import threading
from concurrent.futures import ThreadPoolExecutor

# Subnet based on user's ipconfig
SUBNET_PREFIX = "192.168.2."
# Common ports for web servers / command centers
PORTS_TO_SCAN = [80, 443, 8080, 8000, 5000]

def scan_host(ip):
    open_ports = []
    for port in PORTS_TO_SCAN:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5) # Fast timeout
            result = sock.connect_ex((ip, port))
            if result == 0:
                open_ports.append(port)
            sock.close()
        except:
            pass
    
    if open_ports:
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except:
            hostname = "Unknown"
        return f"{ip} ({hostname}): Open ports {open_ports}"
    return None

def main():
    print(f"Scanning subnet {SUBNET_PREFIX}xxx for ports {PORTS_TO_SCAN}...")
    ips = [f"{SUBNET_PREFIX}{i}" for i in range(1, 255)]
    
    found_hosts = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        results = executor.map(scan_host, ips)
        for res in results:
            if res:
                print(f"[FOUND] {res}")
                found_hosts.append(res)
    
    if not found_hosts:
        print("No servers found on common ports.")

if __name__ == "__main__":
    main()
