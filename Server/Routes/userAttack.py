# Routes/userAttack.py
# Routes/Simulate.py
import pandas as pd
import numpy as np
import pickle

from sklearn.preprocessing import LabelEncoder

le_protocol = LabelEncoder().fit(['tcp', 'udp', 'icmp'])
le_service = LabelEncoder().fit(['ftp_data', 'ftp', 'ssh', 'telnet', 'smtp', 'http', 'eco_i', 'ecr_i', 'urp_i', 'other', 'whois', 'domain_u', 'mtp', 'finger', 'ctf', 'hostnames', 'idup', 'pop_3', 'sunrcp', 'uucp_path', 'netbios_ns', 'netbios_dgm', 'netbios_ssn', 'imap4', 'pm_dump', 'http_443', 'exec', 'login', 'remote_job', 'uucp', 'courier', 'x11', 'discard', 'csnet_ns', 'other'])
le_flag = LabelEncoder().fit(['S0', 'S1', 'S2', 'SF', 'S3', 'SH', 'REJ', 'RSTO', 'RSTR'])

# load the trained model from disk
filename = "models/random_forest_model.sav"
random_forest_model = pickle.load(open(filename, 'rb'))
filename2 = "models/Linear_SVM_model.sav"
svm_model = pickle.load(open(filename2, 'rb'))

def preprocess_custom_input(custom_input):
    protocol = le_protocol.transform([custom_input.protocol_type])[0]
    service = le_service.transform([custom_input.services])[0]
    flag = le_flag.transform([custom_input.flag])[0]

    feature_vector = [
        custom_input.duration, protocol, service, flag,
        custom_input.src_byte, custom_input.dstn_byte,
        custom_input.logged_in, custom_input.wrong_frag,
        custom_input.same_dest_count, custom_input.same_port_count
    ]
    feature_vector += [0] * (122 - len(feature_vector))
    return np.array(feature_vector).reshape(1, -1)
def attack(test):
    features = preprocess_custom_input(test)
    predictions = random_forest_model.predict(features)
    probabilities = random_forest_model.predict_proba(features)
    probabilities = probabilities[0]
    predictionssvm = svm_model.predict(features)
    probabilitiessvm = svm_model.predict_proba(features)
    probabilitiessvm = probabilitiessvm[0]
    for i in range(5):
        probabilities[i] = "{:.2f}".format(probabilities[i]*100)
    
    for i in range(5):
        probabilitiessvm[i] = "{:.2f}".format(probabilitiessvm[i]*100)
   
    return(predictions[0], list(probabilities), predictionssvm[0], list(probabilitiessvm))