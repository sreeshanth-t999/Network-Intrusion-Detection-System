# testing/prob.py
from scapy.all import *
import random

target_ip = target_ip = input("enter the target ip:")
ports = [21, 22, 23, 25, 53, 80, 443, 8080]  # Common ports

def probe_attack(target_ip, ports):
    print(f"Starting Probe Attack on {target_ip}...")
    for port in ports:
        src_port = random.randint(1024, 65535)  # Random source port
        ip_layer = IP(dst=target_ip)
        tcp_layer = TCP(sport=src_port, dport=port, flags="S")  # SYN packet
        packet = ip_layer / tcp_layer
        send(packet, verbose=False)
        print(f"Probing port {port}...")

probe_attack(target_ip, ports)
