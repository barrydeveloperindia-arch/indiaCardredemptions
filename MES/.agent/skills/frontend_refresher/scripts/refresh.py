import subprocess
import time

def refresh_ui():
    print("[*] Force-Refeshing MES Frontend...")
    try:
        subprocess.run(["docker", "restart", "englabs_frontend"], check=True)
        print("[+] Frontend Restarted. Vite is rebuilding...")
        print("[!] Please wait 10 seconds before reloading your browser.")
    except Exception as e:
        print(f"❌ Failed to restart: {e}")

if __name__ == "__main__":
    refresh_ui()
