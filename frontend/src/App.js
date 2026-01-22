import { useEffect, useState, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Blocks } from "./pages/Blocks";
import { Transactions } from "./pages/Transactions";
import { Accounts } from "./pages/Accounts";
import { SendTransaction } from "./pages/SendTransaction";
import { NodeInfo } from "./pages/NodeInfo";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [beaconStatus, setBeaconStatus] = useState(null);
  const [signerStatus, setSignerStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [blockchainRes, beaconRes, signerRes, statsRes] = await Promise.all([
        axios.get(`${API}/blockchain/status`),
        axios.get(`${API}/beacon/status`),
        axios.get(`${API}/signer/status`),
        axios.get(`${API}/stats/overview`),
      ]);
      setBlockchainStatus(blockchainRes.data);
      setBeaconStatus(beaconRes.data);
      setSignerStatus(signerRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div className="App dark">
      <BrowserRouter>
        <Layout 
          blockchainStatus={blockchainStatus}
          onRefresh={fetchAllData}
          isRefreshing={isRefreshing}
        >
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  blockchainStatus={blockchainStatus}
                  beaconStatus={beaconStatus}
                  signerStatus={signerStatus}
                  stats={stats}
                />
              } 
            />
            <Route path="/blocks" element={<Blocks />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/send" element={<SendTransaction />} />
            <Route path="/node-info" element={<NodeInfo />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
