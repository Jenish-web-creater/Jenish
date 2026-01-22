import { useEffect, useState } from "react";
import { RefreshCw, Activity, Zap, Users } from "lucide-react";
import { Button } from "../ui/button";

export const Header = ({ blockchainStatus, onRefresh, isRefreshing }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      data-testid="header"
      className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left - Status Indicators */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,153,0.6)] animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">
              {blockchainStatus?.is_syncing ? "SYNCING" : "SYNCED"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-mono text-xs">
              BLOCK #{blockchainStatus?.current_block?.toLocaleString() || "---"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-mono text-xs">
              {blockchainStatus?.peer_count || 0} PEERS
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-mono text-xs">
              {blockchainStatus?.gas_price || "-- Gwei"}
            </span>
          </div>
        </div>

        {/* Right - Time and Refresh */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            {time.toUTCString()}
          </span>
          <Button
            data-testid="refresh-button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
};
