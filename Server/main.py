# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from threading import Thread
from collections import deque
from datetime import datetime
from pymongo import MongoClient
from collections import defaultdict
import psutil
from Routes.sniff import start_sniffer
from Routes.dataset import dataset_filter
from Routes.Simulate import main
from Routes.userAttack import attack

app = FastAPI()

MONGO_URL = "mongodb://localhost:27017"
client = MongoClient(MONGO_URL)
db = client["network_intrusion"]
activity_collection = db["network_activity"]
prob_collection = db["prob_activity"]
dos_collection = db["dos_activity"]
u2r_collection = db["u2r_activity"]
r2l_collection = db["r2l_activity"]
normal_collection = db["normal_activity"]
class Item(BaseModel):
    type: str

class InputData(BaseModel):
    duration: int
    protocol_type: str
    services: str
    flag: str
    src_byte: int
    dstn_byte: int
    logged_in: int
    wrong_frag: int
    same_dest_count: int
    same_port_count: int
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    sniff_thread = Thread(target=start_sniffer, daemon=True)
    sniff_thread.start()

@app.get("/dashboard")
def get_dashboard_data():
    try:
        collections = {
            "prob": prob_collection,
            "dos":dos_collection,
            "u2r": u2r_collection,
            "r2l": r2l_collection,
            "normal": normal_collection
        }

        month_wise_data = defaultdict(lambda: {"prob": 0, "u2r": 0, "r2l": 0, "normal": 0,"dos":0})

        for category, collection in collections.items():
            activities = list(collection.find({}, {"_id": 0, "timestamp": 1}))  # Assuming each document has a `timestamp`
            for activity in activities:
                if "timestamp" in activity:
                    date_obj = datetime.strptime(activity["timestamp"], "%Y-%m-%d %H:%M:%S")
                    month = date_obj.strftime("%Y-%m-%d")  # Format as YYYY-MM
                    month_wise_data[month][category] += 1

        # Convert dictionary to list for frontend
        result = [{"day": month, **counts} for month, counts in sorted(month_wise_data.items())]

        return {"dayWiseData": result}
    
    except Exception as e:
        print(f"Error fetching activities: {e}")
        return {"error": "Unable to fetch activities", "details": str(e)}
@app.get("/activities/")
def get_activities():
    print("Fetching activities from MongoDB...")
    try:
    
        activities = list(activity_collection.find())
        for activity in activities:
            activity["_id"] = str(activity["_id"])
        return activities
    except Exception as e:
        print(f"Error fetching activities: {e}")
        return {"error": "Unable to fetch activities", "details": str(e)}
@app.get("/Traffic/")
def get_Traffic():
    return('Traffic')

@app.post('/attackSimulate/')
async def attack_Simulate(input_data: InputData):
   pred, prob, predsvm, probsvm = attack(input_data)
   attacks = ["normal","dos","r2l","u2r","probe"]
   dict = {"predictions":attacks[pred], "normal":prob[0], "dos":prob[1], "u2r":prob[3], "r2l":prob[2], "probe":prob[4]}
   dictsvm = {"predictionssvm":attacks[predsvm], "normal":probsvm[0], "dos":probsvm[1], "u2r":probsvm[3], "r2l":probsvm[2], "probe":probsvm[4]}
   return({
       'rfm':dict,
       'svm':dictsvm,
    })
   
@app.post("/simulate/")
def get_simulate(item:Item):
    expected = item.type
    print(item.type)
    pred, prob, predsvm, probsvm = main(item.type)
    attacks = ["normal","dos","r2l","u2r","probe"]
    dict = {"expected":expected,"predictions":attacks[pred], "normal":prob[0], "dos":prob[1], "u2r":prob[3], "r2l":prob[2], "probe":prob[4]}
    dictsvm = {"expected":expected,"predictionssvm":attacks[predsvm], "normal":probsvm[0], "dos":probsvm[1], "u2r":probsvm[3], "r2l":probsvm[2], "probe":probsvm[4]}
    return({
       'rfm':dict,
       'svm':dictsvm,
    })


@app.get("/dataset/")
def get_dataset():
    data = dataset_filter()
    return {"data": data}

system_performance_history = deque(maxlen=7)

@app.get("/system-performance")
def get_system_performance():
    cpu_percent = psutil.cpu_percent(interval=1)  # CPU Usage (%)
    memory_percent = psutil.virtual_memory().percent  # Memory Usage (%)
    net_io = psutil.net_io_counters()
    network_sent = net_io.bytes_sent / 1024  # Convert to KB
    network_recv = net_io.bytes_recv / 1024  # Convert to KB
    
    timestamp = datetime.now().strftime("%H:%M:%S")  # Get current time (HH:MM:SS)
    
    # Store in history
    system_performance_history.append({
        "time": timestamp,
        "cpu": cpu_percent,
        "memory": memory_percent,
        "network_sent": network_sent,
        "network_recv": network_recv
    })

    return {"systemData": list(system_performance_history)}


# .\.venv\scripts\Activate

# uvicorn main:app --reload