import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Server, Radio, Shield, Copy, Database, Network, HardDrive, Cpu } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InfoRow = ({ label, value, copyable = false }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-right max-w-[300px] truncate">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" strokeWidth={1.5} />
          </Button>
        )}
      </div>
    </div>
  );
};

export const NodeInfo = () => {
  const [nodeInfo, setNodeInfo] = useState(null);
  const [beaconStatus, setBeaconStatus] = useState(null);
  const [signerStatus, setSignerStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllInfo();
  }, []);

  const fetchAllInfo = async () => {
    try {
      setLoading(true);
      const [nodeRes, beaconRes, signerRes] = await Promise.all([
        axios.get(`${API}/node-info`),
        axios.get(`${API}/beacon/status`),
        axios.get(`${API}/signer/status`),
      ]);
      setNodeInfo(nodeRes.data);
      setBeaconStatus(beaconRes.data);
      setSignerStatus(signerRes.data);
    } catch (error) {
      console.error("Error fetching node info:", error);
      toast.error("Failed to fetch node information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div data-testid="node-info-page" className="flex items-center justify-center h-[50vh]">
        <span className="font-mono text-xs text-muted-foreground">Loading node information...</span>
      </div>
    );
  }

  return (
    <div data-testid="node-info-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Node Information</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Configuration and status of blockchain nodes
          </p>
        </div>
        <Button
          data-testid="refresh-node-info"
          variant="outline"
          onClick={fetchAllInfo}
          className="font-mono text-xs uppercase tracking-wider"
        >
          Refresh
        </Button>
      </div>

      {/* Version Banner */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-sm bg-primary/10">
                <Cpu className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-mono text-sm font-semibold">Private Geth Network</h3>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  Running Geth + Lighthouse + Clef stack
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Geth Node Info */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" strokeWidth={1.5} />
              Geth Execution Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <InfoRow label="Version" value={nodeInfo?.geth_version || "---"} />
              <InfoRow label="Chain ID" value={nodeInfo?.chain_id?.toString() || "---"} />
              <InfoRow label="Network ID" value={nodeInfo?.network_id?.toString() || "---"} />
              <InfoRow label="Data Directory" value={nodeInfo?.data_dir || "---"} />
              <InfoRow label="IPC Path" value={nodeInfo?.ipc_path || "---"} copyable />
              <InfoRow label="HTTP Enabled" value={nodeInfo?.http_enabled ? "Yes" : "No"} />
              <InfoRow label="HTTP Port" value={nodeInfo?.http_port?.toString() || "---"} />
              <InfoRow label="WebSocket Enabled" value={nodeInfo?.ws_enabled ? "Yes" : "No"} />
              <InfoRow label="WebSocket Port" value={nodeInfo?.ws_port?.toString() || "---"} />
            </div>
          </CardContent>
        </Card>

        {/* Lighthouse Beacon Info */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Radio className="h-4 w-4" strokeWidth={1.5} />
              Lighthouse Beacon Node
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <InfoRow label="Client" value={beaconStatus?.client_name || "---"} />
              <InfoRow label="Version" value={beaconStatus?.version || "---"} />
              <InfoRow label="Sync Status" value={beaconStatus?.is_syncing ? "Syncing" : "Synced"} />
              <InfoRow label="Head Slot" value={beaconStatus?.head_slot?.toLocaleString() || "---"} />
              <InfoRow label="Sync Distance" value={beaconStatus?.sync_distance?.toString() || "---"} />
              <InfoRow label="Finalized Epoch" value={beaconStatus?.finalized_epoch?.toLocaleString() || "---"} />
              <InfoRow label="Justified Epoch" value={beaconStatus?.justified_epoch?.toLocaleString() || "---"} />
              <InfoRow label="Peer Count" value={beaconStatus?.peer_count?.toString() || "---"} />
              <InfoRow label="EL Offline" value={beaconStatus?.el_offline ? "Yes" : "No"} />
            </div>
          </CardContent>
        </Card>

        {/* Clef Signer Info */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" strokeWidth={1.5} />
              Clef External Signer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <InfoRow label="Signer" value={signerStatus?.signer_name || "---"} />
              <InfoRow label="Version" value={signerStatus?.version || "---"} />
              <InfoRow label="Status" value={signerStatus?.is_connected ? "Connected" : "Disconnected"} />
              <InfoRow label="Managed Accounts" value={signerStatus?.accounts?.length?.toString() || "0"} />
              <InfoRow label="Pending Requests" value={signerStatus?.pending_requests?.toString() || "0"} />
            </div>
            
            {signerStatus?.accounts && signerStatus.accounts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Managed Accounts
                </p>
                <div className="space-y-2">
                  {signerStatus.accounts.map((account, index) => (
                    <div key={account} className="flex items-center gap-2 py-1 px-2 rounded-sm bg-background/50 border border-border/50">
                      <span className="font-mono text-[10px] text-muted-foreground">#{index + 1}</span>
                      <span className="font-mono text-xs truncate flex-1">{account}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(account);
                          toast.success("Address copied");
                        }}
                        className="h-5 w-5 p-0"
                      >
                        <Copy className="h-3 w-3" strokeWidth={1.5} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enode Info */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Network className="h-4 w-4" strokeWidth={1.5} />
              Network Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Enode URL
                </p>
                <div className="p-3 rounded-sm bg-background/50 border border-border/50">
                  <p className="font-mono text-xs break-all">{nodeInfo?.enode || "---"}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(nodeInfo?.enode || "");
                    toast.success("Enode copied");
                  }}
                  className="mt-2 font-mono text-xs"
                >
                  <Copy className="h-3 w-3 mr-2" strokeWidth={1.5} />
                  Copy Enode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Summary */}
      <Card className="border-border bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4" strokeWidth={1.5} />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-sm bg-background/50 border border-border/50 text-center">
              <p className="font-mono text-2xl font-bold text-primary">{nodeInfo?.chain_id || "---"}</p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Chain ID</p>
            </div>
            <div className="p-4 rounded-sm bg-background/50 border border-border/50 text-center">
              <p className="font-mono text-2xl font-bold">{nodeInfo?.http_port || "---"}</p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">HTTP Port</p>
            </div>
            <div className="p-4 rounded-sm bg-background/50 border border-border/50 text-center">
              <p className="font-mono text-2xl font-bold">{nodeInfo?.ws_port || "---"}</p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">WS Port</p>
            </div>
            <div className="p-4 rounded-sm bg-background/50 border border-border/50 text-center">
              <p className="font-mono text-2xl font-bold">{signerStatus?.accounts?.length || 0}</p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Accounts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
