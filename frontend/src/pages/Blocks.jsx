import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Blocks as BlocksIcon, Search, ChevronLeft, ChevronRight, ExternalLink, Copy } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Blocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchBlocks();
  }, [page]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/blocks?limit=${limit}&offset=${page * limit}`);
      setBlocks(res.data);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      toast.error("Failed to fetch blocks");
    } finally {
      setLoading(false);
    }
  };

  const searchBlock = async () => {
    if (!searchQuery) {
      fetchBlocks();
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API}/blocks/${searchQuery}`);
      setBlocks([res.data]);
    } catch (error) {
      toast.error("Block not found");
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const viewBlockDetails = async (blockNumber) => {
    try {
      const res = await axios.get(`${API}/blocks/${blockNumber}`);
      setSelectedBlock(res.data);
      setDialogOpen(true);
    } catch (error) {
      toast.error("Failed to fetch block details");
    }
  };

  const truncateHash = (hash) => {
    if (!hash) return "---";
    return `${hash.slice(0, 14)}...${hash.slice(-10)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "---";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div data-testid="blocks-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Blocks</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Browse and search blockchain blocks
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                data-testid="block-search-input"
                placeholder="Search by block number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchBlock()}
                className="pl-10 font-mono text-xs bg-background border-border"
              />
            </div>
            <Button
              data-testid="block-search-button"
              onClick={searchBlock}
              className="font-mono text-xs uppercase tracking-wider"
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocks Table */}
      <Card className="border-border bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BlocksIcon className="h-4 w-4" strokeWidth={1.5} />
            Recent Blocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Block</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Hash</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Miner</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">TXs</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Gas Used</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Time</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <span className="font-mono text-xs text-muted-foreground">Loading blocks...</span>
                  </TableCell>
                </TableRow>
              ) : blocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <span className="font-mono text-xs text-muted-foreground">No blocks found</span>
                  </TableCell>
                </TableRow>
              ) : (
                blocks.map((block) => (
                  <TableRow key={block.number} className="border-border hover:bg-accent/50">
                    <TableCell className="font-mono text-xs text-primary">
                      #{block.number?.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncateHash(block.hash)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {truncateHash(block.miner)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {block.transactions_count}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {(block.gas_used / 1000000).toFixed(2)}M
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTimestamp(block.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button
                        data-testid={`view-block-${block.number}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => viewBlockDetails(block.number)}
                        className="font-mono text-xs"
                      >
                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="font-mono text-xs text-muted-foreground">
              Page {page + 1}
            </span>
            <div className="flex gap-2">
              <Button
                data-testid="prev-page"
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="font-mono text-xs"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              <Button
                data-testid="next-page"
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={blocks.length < limit}
                className="font-mono text-xs"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg">
              Block #{selectedBlock?.number?.toLocaleString()}
            </DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Block Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all">{selectedBlock.hash}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedBlock.hash)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Parent Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all">{selectedBlock.parent_hash}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedBlock.parent_hash)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Miner</p>
                  <p className="font-mono text-xs mt-1 truncate">{selectedBlock.miner}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Gas Used</p>
                  <p className="font-mono text-xs mt-1">{selectedBlock.gas_used?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Gas Limit</p>
                  <p className="font-mono text-xs mt-1">{selectedBlock.gas_limit?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Transactions</p>
                  <p className="font-mono text-xs mt-1">{selectedBlock.transactions_count}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Size</p>
                  <p className="font-mono text-xs mt-1">{selectedBlock.size?.toLocaleString()} bytes</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Nonce</p>
                  <p className="font-mono text-xs mt-1">{selectedBlock.nonce}</p>
                </div>
              </div>

              <div className="p-3 rounded-sm bg-background border border-border">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Timestamp</p>
                <p className="font-mono text-xs mt-1">{formatTimestamp(selectedBlock.timestamp)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
