// src/context/SimulateContext.jsx
import { createContext, useEffect, useState } from "react";
import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const SimulateContext = createContext();

export const SimulateContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [type, setType] = useState(""); // Default empty string
  const [attack, setAttack] = useState(null);
  const [menubar, setMenubar] = useState("Dashboard");
  const [trafficData, setTrafficData] = useState([]);
  const [dashdata, setDashdata] = useState();
  

  // Fetch dataset
  const getDataset = async () => {
    try {
      const response = await instance.get("/dataset/");
      console.log("Dataset:", response.data.data);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching dataset:", error);
    }
  };

  // Manually trigger attack simulation
  const createAttack = async () => {
    if (!type) {
      console.error("Attack type is not set!");
      return;
    }

    console.log("Simulating attack with type:", type);
    try {
      const response = await instance.post("/simulate/", { type });

      // Ensure response is correctly formatted
      setAttack(response.data); // No need to JSON.stringify; React handles objects fine
      console.log("Attack Simulation Response:", response.data);
    } catch (error) {
      console.error("Error simulating attack:", error);
    }
  };

  // Attack simulation with input parameters
  const simulateAttack = async (attackData) => {
    console.log("Simulating attack with data:", attackData);
    try {
      const response = await instance.post("/attackSimulate/", attackData);

      // Ensure response is correctly formatted
      return response.data
      console.log("Simulated Attack Response:", response.data);
    } catch (error) {
      console.error("Error in attack simulation:", error);
    }
  };

  // Fetch traffic data
  const fetchTraffic = async () => {
    try {
      const response = await instance.get("/activities/");
      const activities = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? response.data?.activities ?? [];
      setTrafficData(activities);
      console.log("Fetched Traffic Data:", activities);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
    }
  };

  const dashboard = async ()=>{
    try{
      const res = await instance.get("/dashboard/");
       setDashdata(res.data)
    } catch (error){
      console.log(error)
    }
  }

  // Fetch dataset on mount
  useEffect(() => {
    getDataset();
    dashboard()
  }, []);

  return (
    <SimulateContext.Provider
      value={{
        dashdata,
        fetchTraffic,
        trafficData,
        menubar,
        setMenubar,
        data,
        setType,
        attack,
        createAttack,
        simulateAttack,
      }}
    >
      {children}
    </SimulateContext.Provider>
  );
};
