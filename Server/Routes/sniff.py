# Routes/sniff.py
# sniff.py

from scapy.all import sniff
from scapy.layers.inet import IP, TCP, UDP, ICMP

import numpy as np
import pickle
import time
from datetime import datetime

from sklearn.preprocessing import LabelEncoder
from fastapi.middleware.cors import CORSMiddleware
import math
from pymongo import MongoClient

# Dictionaries to store connection and port data
connection_data = {}
destination_port_count = {}
same_dest_ip_count = {}

MONGO_URL = "mongodb://localhost:27017"
client = MongoClient(MONGO_URL)
db = client["network_intrusion"]
activity_collection = db["network_activity"]
dos_collection = db["dos_activity"]
prob_collection = db["prob_activity"]
u2r_collection = db["u2r_activity"]
r2l_collection = db["r2l_activity"]
normal_collection = db["normal_activity"]

# FastAPI setup

# Port-to-service mapping
PROTOCOL_PORTS = {
    20: 'ftp_data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp',
    43: 'whois', 53: 'domain_u', 57: 'mtp', 79: 'finger', 80: 'http',
    84: 'ctf', 101: 'hostnames', 104: 'idup', 110: 'pop_3', 111: 'sunrcp',
    117: 'uucp_path', 137: 'netbios_ns', 138: 'netbios_dgm', 139: 'netbios_ssn',
    143: 'imap4', 170: 'pm_dump', 443: 'http_443', 512: 'exec', 513: 'login',
    514: 'remote_job', 540: 'uucp', 601: 'courier', 6000: 'x11', 9: 'discard',
    105: 'csnet_ns', 601: 'courier'
}

# Function to determine TCP connection state
def get_connection_state(pkt):
    if pkt.haslayer(TCP):
        flags = pkt[TCP].flags
        if flags == 0x02:  # SYN
            return "S0"
        elif flags == 0x12:  # SYN-ACK
            return "S1"
        elif flags == 0x10:  # ACK
            return "S2"
        elif flags & 0x04:  # RST
            return "REJ" if flags & 0x10 else "RSTO"
        elif flags == 0x01:  # FIN
            return "S3"
        elif flags & 0x01 and flags & 0x10:  # FIN + ACK
            return "SF"
        elif flags & 0x02 and flags & 0x01:  # SYN + FIN
            return "SH"
    
# Function to check for wrong fragments
def is_wrong_fragment(pkt):
    if IP in pkt:
        ip_layer = pkt[IP]
        return ip_layer.frag != 0 or ip_layer.flags & 0x1
    return False

# Process incoming packets
def process_packet(pkt):
    if IP in pkt:
        src_ip = pkt[IP].src
        dst_ip = pkt[IP].dst
        protocol, state, dst_port, service = None, None, None, "other"

        if pkt.haslayer(TCP):
            protocol = "tcp"
            state = get_connection_state(pkt)
            dst_port = pkt[TCP].dport
        elif pkt.haslayer(UDP):
            protocol = "udp"
            dst_port = pkt[UDP].dport
        elif pkt.haslayer(ICMP):
            protocol = "icmp"
            icmp_layer = pkt[ICMP]
            service = 'eco_i' if icmp_layer.type == 8 else 'ecr_i' if icmp_layer.type == 0 else 'urp_i'

        if protocol == "tcp" and state is None:
            return

        if protocol != 'icmp' and dst_port in PROTOCOL_PORTS:
            service = PROTOCOL_PORTS[dst_port]

        wrong_fragment = is_wrong_fragment(pkt)

        if dst_ip not in same_dest_ip_count:
            same_dest_ip_count[dst_ip] = 0
        same_dest_ip_count[dst_ip] += 1

        if dst_port is not None:
            if dst_port not in destination_port_count:
                destination_port_count[dst_port] = 0
            destination_port_count[dst_port] += 1
        same_port_count = destination_port_count.get(dst_port, 0)

        connection_key = f"{src_ip}:{dst_ip}:{protocol}:{dst_port}"
        if connection_key not in connection_data:
            connection_data[connection_key] = {"start_time": time.time(), "src_bytes": 0, "dst_bytes": 0, "login_status": 0}

        current_time = time.time()
        duration = current_time - connection_data[connection_key]["start_time"]

        payload_size = len(pkt[IP].payload)
        connection_data[connection_key]["src_bytes"] += payload_size
        connection_data[connection_key]["dst_bytes"] += payload_size

        if protocol == "tcp" and dst_port == 22 and state == "S2":
            connection_data[connection_key]["login_status"] = 1

        custom_input = {
            "Duration": math.floor(duration),
            "Protocol": protocol,
            "Service": service,
            "Flag": state if protocol == 'tcp' else 'SF',
            "SrcBytes": connection_data[connection_key]['src_bytes'],
            "DstBytes": connection_data[connection_key]['dst_bytes'],
            "LoginStatus": connection_data[connection_key]['login_status'],
            "WrongFragment": 1 if wrong_fragment else 0,
            "SameDestCount": same_dest_ip_count[dst_ip],
            "SamePortCount": same_port_count
        }

        result = predict_custom_input(custom_input)
        if Class_predict(result['svm_pred']) == "Prob":
            probData =  {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Use UTC time for consistency
                "month": datetime.utcnow().strftime("%Y-%m"),  # Format: "2025-02"
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": protocol,
                "attack_type_svm": Class_predict(result['svm_pred']),
                "attack_type_rfm": Class_predict(result['rfm_pred']),
                "svm_probabilities": {
                        "normal": "{:.2f}".format(result['svm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['svm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['svm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['svm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['svm_prob'][4]*100),
                },
                "rfm_probabilities": {
                        "normal": "{:.2f}".format(result['rfm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['rfm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['rfm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['rfm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['rfm_prob'][4]*100),
                },
                "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            prob_collection.insert_one(probData)
        elif Class_predict(result['svm_pred']) == "u2r":
            u2rData =  {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Use UTC time for consistency
                "month": datetime.utcnow().strftime("%Y-%m"),  # Format: "2025-02"
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": protocol,
                "attack_type_svm": Class_predict(result['svm_pred']),
                "attack_type_rfm": Class_predict(result['rfm_pred']),
                "svm_probabilities": {
                        "normal": "{:.2f}".format(result['svm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['svm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['svm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['svm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['svm_prob'][4]*100),
                },
                "rfm_probabilities": {
                        "normal": "{:.2f}".format(result['rfm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['rfm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['rfm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['rfm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['rfm_prob'][4]*100),
                },
                "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            u2r_collection.insert_one(u2rData)
        if Class_predict(result['svm_pred']) == "r2l":
            r2lData =  {
                "time":datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Use UTC time for consistency
                "month": datetime.utcnow().strftime("%Y-%m"),  # Format: "2025-02"
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": protocol,
                "attack_type_svm": Class_predict(result['svm_pred']),
                "attack_type_rfm": Class_predict(result['rfm_pred']),
                "svm_probabilities": {
                        "normal": "{:.2f}".format(result['svm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['svm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['svm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['svm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['svm_prob'][4]*100),
                },
                "rfm_probabilities": {
                        "normal": "{:.2f}".format(result['rfm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['rfm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['rfm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['rfm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['rfm_prob'][4]*100),
                },
                "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            r2l_collection.insert_one(r2lData)
        if Class_predict(result['svm_pred']) == "Dos"   :
            DosData =  {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Use UTC time for consistency
                "month": datetime.utcnow().strftime("%Y-%m"),  # Format: "2025-02"
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": protocol,
                "attack_type_svm": Class_predict(result['svm_pred']),
                "attack_type_rfm": Class_predict(result['rfm_pred']),
                "svm_probabilities": {
                        "normal": "{:.2f}".format(result['svm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['svm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['svm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['svm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['svm_prob'][4]*100),
                },
                "rfm_probabilities": {
                        "normal": "{:.2f}".format(result['rfm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['rfm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['rfm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['rfm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['rfm_prob'][4]*100),
                },
                "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            dos_collection.insert_one(DosData)
        if Class_predict(result['svm_pred']) == "normal"   :
            normalData = {
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Use UTC time for consistency
                "month": datetime.utcnow().strftime("%Y-%m"),  # Format: "2025-02"
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": protocol,
                "attack_type_svm": Class_predict(result['svm_pred']),
                "attack_type_rfm": Class_predict(result['rfm_pred']),
                "svm_probabilities": {
                        "normal": "{:.2f}".format(result['svm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['svm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['svm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['svm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['svm_prob'][4]*100),
                },
                "rfm_probabilities": {
                        "normal": "{:.2f}".format(result['rfm_prob'][0]*100),
                        "dos":  "{:.2f}".format(result['rfm_prob'][1]*100),
                        "probe": "{:.2f}".format(result['rfm_prob'][2]*100),
                        "r2l": "{:.2f}".format(result['rfm_prob'][3]*100),
                        "u2r": "{:.2f}".format(result['rfm_prob'][4]*100),
                },
                "timestamp":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            normal_collection.insert_one(normalData)
            
        activity_data = {
    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S") ,
    "src_ip": src_ip,
    "dst_ip": dst_ip,
    "duration":math.floor(duration),
    "protocol": protocol,
    "service": service,
    "Flag": state if protocol == 'tcp' else 'SF',
    "SrcBytes": connection_data[connection_key]['src_bytes'],
    "DstBytes": connection_data[connection_key]['dst_bytes'],
    "LoginStatus": connection_data[connection_key]['login_status'],
    "WrongFragment": 1 if wrong_fragment else 0,
    "SameDestCount": same_dest_ip_count[dst_ip],
    "SamePortCount": same_port_count,
    "prediction_svm": Class_predict(result['svm_pred']),
    "prediction_rfm": Class_predict(result['rfm_pred']),
    "svm_probabilities": {
        "normal": "{:.2f}".format(result['svm_prob'][0]*100),
        "dos":  "{:.2f}".format(result['svm_prob'][1]*100),
        "probe": "{:.2f}".format(result['svm_prob'][2]*100),
        "r2l": "{:.2f}".format(result['svm_prob'][3]*100),
        "u2r": "{:.2f}".format(result['svm_prob'][4]*100),
    },
    "rfm_probabilities": {
        "normal": "{:.2f}".format(result['rfm_prob'][0]*100),
        "dos":  "{:.2f}".format(result['rfm_prob'][1]*100),
        "probe": "{:.2f}".format(result['rfm_prob'][2]*100),
        "r2l": "{:.2f}".format(result['rfm_prob'][3]*100),
        "u2r": "{:.2f}".format(result['rfm_prob'][4]*100),
    }
  }


        # Update or insert document in MongoDB
        activity_collection.update_one(
            {"src_ip": src_ip},  # Match by source IP
            {"$set": activity_data},  # Update document with new data
            upsert=True  # Insert if no document matches
        )
def Class_predict(prediction):
     if prediction==0:
               return 'normal'
     elif prediction==1:
              return 'Dos'
     elif prediction==2:
              return 'Prob'
     elif prediction==3:
              return 'u2r'
     else:
            return 'r2l'
# Machine learning model loading
rfm = pickle.load(open('models\\random_forest_model.sav', "rb"))
svm = pickle.load(open('models\\Linear_SVM_model.sav', 'rb'))

# Label encoders
le_protocol = LabelEncoder().fit(['tcp', 'udp', 'icmp'])
le_service = LabelEncoder().fit(['ftp_data', 'ftp', 'ssh', 'telnet', 'smtp', 'http', 'eco_i', 'ecr_i', 'urp_i', 'other', 'whois', 'domain_u', 'mtp', 'finger', 'ctf', 'hostnames', 'idup', 'pop_3', 'sunrcp', 'uucp_path', 'netbios_ns', 'netbios_dgm', 'netbios_ssn', 'imap4', 'pm_dump', 'http_443', 'exec', 'login', 'remote_job', 'uucp', 'courier', 'x11', 'discard', 'csnet_ns', 'other'])
le_flag = LabelEncoder().fit(['S0', 'S1', 'S2', 'SF', 'S3', 'SH', 'REJ', 'RSTO', 'RSTR'])

# Preprocessing input for models
def preprocess_custom_input(custom_input):
    protocol = le_protocol.transform([custom_input["Protocol"]])[0]
    service = le_service.transform([custom_input["Service"]])[0]
    flag = le_flag.transform([custom_input["Flag"]])[0]

    feature_vector = [
        custom_input["Duration"], protocol, service, flag,
        custom_input["SrcBytes"], custom_input["DstBytes"],
        custom_input["LoginStatus"], custom_input["WrongFragment"],
        custom_input["SameDestCount"], custom_input["SamePortCount"]
    ]
    feature_vector += [0] * (122 - len(feature_vector))
    return np.array(feature_vector).reshape(1, -1)

def predict_custom_input(custom_input):
    features = preprocess_custom_input(custom_input)
    return {
        'svm_pred': svm.predict(features),
        'svm_prob': svm.predict_proba(features)[0],
        'rfm_pred': rfm.predict(features),
        'rfm_prob': rfm.predict_proba(features)[0]
    }

# Start the sniffer
def start_sniffer():
    sniff(filter="ip", prn=process_packet, store=0)

