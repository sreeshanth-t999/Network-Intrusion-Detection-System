# testing/u2r.py
import subprocess

# Simulating a buffer overflow attack
payload = "A" * 500  # Overflow buffer with 500 'A' characters

print("Simulating U2R Attack...")

# Replace 'vulnerable_program' with an actual vulnerable binary in a test environment
try:
    subprocess.run(["vulnerable_program", payload], check=True)
except Exception as e:
    print(f"Attack failed: {e}")
