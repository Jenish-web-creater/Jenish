import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Blocks,
  ArrowRightLeft,
  Wallet,
  Activity,
  Server,
  Radio,
  Shield,
  Zap,
  Clock,
  Database,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusBadge = ({ status }) => {
  if (status === "online" || status === "synced" || status === "connected") {
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] uppercase">
        <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
        {status}
      </Badge>
    );
  }
  if (status === "syncing") {
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono text-[10px] uppercase">
        <Loader className="h-3 w-3 mr-1.5 animate-spin" />
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 font-mono text-[10px] uppercase">
      <div className="h-1.5 w-1.5 rounded-full bg-destructive mr-1.5" />
      {status}
    </Badge>
  );
};

export const Dashboard = ({ blockchainStatus, beaconStatus, signerStatus, stats }) => {
  const [gasHistory, setGasHistory] = useState([]);
  const [blockHistory, setBlockHistory] = useState([]);
  const [recentTx, setRecentTx] = useState([]);

  useEffect(() => {
    fetchChartData();
    fetchRecentTransactions();
  }, []);

  const fetchChartData = async () => {
    try {
      const [gasRes, blockRes] = await Promise.all([
        axios.get(`${API}/stats/gas-history`),
        axios.get(`${API}/stats/block-history`),
      ]);
      setGasHistory(gasRes.data);
      setBlockHistory(blockRes.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await axios.get(`${API}/transactions?limit=5`);
      setRecentTx(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const truncateHash = (hash) => {
    if (!hash) return "---";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  return (
    <div data-testid="dashboard-page" className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-mono text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Private Geth Network • Chain ID: {blockchainStatus?.chain_id || 1337}
        </p>
      </div>

      {/* Node Status Cards - Bento Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Geth Node Status */}
        <Card data-testid="geth-status-card" className="border-border bg-card/40 hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Geth Node
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold">
                {blockchainStatus?.is_syncing ? "Syncing" : "Synced"}
              </span>
              <StatusBadge status={blockchainStatus?.is_syncing ? "syncing" : "online"} />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Block</span>
                <span className="font-mono">{blockchainStatus?.current_block?.toLocaleString() || "---"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Peers</span>
                <span className="font-mono">{blockchainStatus?.peer_count || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lighthouse Beacon Status */}
        <Card data-testid="beacon-status-card" className="border-border bg-card/40 hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Lighthouse Beacon
            </CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold">
                {beaconStatus?.is_syncing ? "Syncing" : "Synced"}
              </span>
              <StatusBadge status={beaconStatus?.is_syncing ? "syncing" : "online"} />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Head Slot</span>
                <span className="font-mono">{beaconStatus?.head_slot?.toLocaleString() || "---"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Finalized Epoch</span>
                <span className="font-mono">{beaconStatus?.finalized_epoch?.toLocaleString() || "---"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clef Signer Status */}
        <Card data-testid="signer-status-card" className="border-border bg-card/40 hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Clef Signer
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold">
                {signerStatus?.is_connected ? "Connected" : "Offline"}
              </span>
              <StatusBadge status={signerStatus?.is_connected ? "connected" : "offline"} />
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Accounts</span>
                <span className="font-mono">{signerStatus?.accounts?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-mono">{signerStatus?.pending_requests || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border bg-card/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-primary/10">
                <Blocks className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{stats?.total_blocks || 0}</p>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Blocks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-blue-500/10">
                <ArrowRightLeft className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{stats?.total_transactions || 0}</p>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-yellow-500/10">
                <Wallet className="h-5 w-5 text-yellow-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{stats?.total_accounts || 0}</p>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold">{stats?.pending_transactions || 0}</p>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Pending TX</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gas Price Chart */}
        <Card data-testid="gas-chart" className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" strokeWidth={1.5} />
              Gas Price (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gasHistory}>
                  <defs>
                    <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E599" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E599" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #262626',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Area type="monotone" dataKey="gas_price" stroke="#00E599" fill="url(#gasGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Block Production Chart */}
        <Card data-testid="block-chart" className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" strokeWidth={1.5} />
              Block Production (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={blockHistory}>
                  <defs>
                    <linearGradient id="blockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #262626',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Area type="monotone" dataKey="blocks" stroke="#3B82F6" fill="url(#blockGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card data-testid="recent-transactions" className="border-border bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" strokeWidth={1.5} />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTx.map((tx, index) => (
              <div
                key={tx.hash || index}
                className="flex items-center justify-between py-2 px-3 rounded-sm bg-background/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  {tx.status === "confirmed" ? (
                    <CheckCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  ) : tx.status === "pending" ? (
                    <Loader className="h-4 w-4 text-yellow-400 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                  )}
                  <span className="font-mono text-xs">{truncateHash(tx.hash)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-muted-foreground">
                    {truncateHash(tx.from_address)} → {truncateHash(tx.to_address)}
                  </span>
                  <span className="font-mono text-xs text-primary">{tx.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
