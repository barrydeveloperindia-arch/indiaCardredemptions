
from src.main import app
import sys


def print_routes():
    print("Listing all registered routes:")
    for route in app.routes:
        if hasattr(route, "path") and hasattr(route, "methods"):
            print(f"- {route.path} {route.methods}")
        elif hasattr(route, "path"):
             print(f"- {route.path} [MOUNT]")
        else:
             print(f"- {type(route)}")


if __name__ == "__main__":
    print_routes()
