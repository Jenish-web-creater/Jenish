import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import {
  ArrowRightLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Loader,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatusBadge = ({ status }) => {
  if (status === "confirmed") {
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] uppercase">
        <CheckCircle className="h-3 w-3 mr-1" />
        Confirmed
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-mono text-[10px] uppercase">
        <Loader className="h-3 w-3 mr-1 animate-spin" />
        Pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 font-mono text-[10px] uppercase">
      <XCircle className="h-3 w-3 mr-1" />
      Failed
    </Badge>
  );
};

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 15;

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const res = await axios.get(`${API}/transactions?limit=${limit}&offset=${page * limit}${statusParam}`);
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const searchTransaction = async () => {
    if (!searchQuery) {
      fetchTransactions();
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API}/transactions/${searchQuery}`);
      setTransactions([res.data]);
    } catch (error) {
      toast.error("Transaction not found");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewTxDetails = async (txHash) => {
    try {
      const res = await axios.get(`${API}/transactions/${txHash}`);
      setSelectedTx(res.data);
      setDialogOpen(true);
    } catch (error) {
      toast.error("Failed to fetch transaction details");
    }
  };

  const truncateHash = (hash) => {
    if (!hash) return "---";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
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
    <div data-testid="transactions-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Browse and search blockchain transactions
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                data-testid="tx-search-input"
                placeholder="Search by transaction hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchTransaction()}
                className="pl-10 font-mono text-xs bg-background border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter" className="w-40 font-mono text-xs bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="font-mono text-xs">All Status</SelectItem>
                <SelectItem value="confirmed" className="font-mono text-xs">Confirmed</SelectItem>
                <SelectItem value="pending" className="font-mono text-xs">Pending</SelectItem>
                <SelectItem value="failed" className="font-mono text-xs">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              data-testid="tx-search-button"
              onClick={searchTransaction}
              className="font-mono text-xs uppercase tracking-wider"
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" strokeWidth={1.5} />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Tx Hash</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Block</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">From → To</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Value</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <span className="font-mono text-xs text-muted-foreground">Loading transactions...</span>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <span className="font-mono text-xs text-muted-foreground">No transactions found</span>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.hash} className="border-border hover:bg-accent/50">
                    <TableCell className="font-mono text-xs text-primary">
                      {truncateHash(tx.hash)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.block_number ? `#${tx.block_number.toLocaleString()}` : "Pending"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>{truncateHash(tx.from_address)}</span>
                        <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                        <span>{truncateHash(tx.to_address)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-primary">
                      {tx.value}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        data-testid={`view-tx-${tx.hash?.slice(0, 10)}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => viewTxDetails(tx.hash)}
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
                data-testid="tx-prev-page"
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="font-mono text-xs"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </Button>
              <Button
                data-testid="tx-next-page"
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={transactions.length < limit}
                className="font-mono text-xs"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg flex items-center gap-2">
              Transaction Details
              {selectedTx && <StatusBadge status={selectedTx.status} />}
            </DialogTitle>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all">{selectedTx.hash}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedTx.hash)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">From</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all">{selectedTx.from_address}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedTx.from_address)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">To</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs break-all">{selectedTx.to_address}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedTx.to_address)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Value</p>
                  <p className="font-mono text-sm mt-1 text-primary">{selectedTx.value}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Gas</p>
                  <p className="font-mono text-sm mt-1">{selectedTx.gas?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Gas Price</p>
                  <p className="font-mono text-sm mt-1">{selectedTx.gas_price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Block Number</p>
                  <p className="font-mono text-sm mt-1">
                    {selectedTx.block_number ? `#${selectedTx.block_number.toLocaleString()}` : "Pending"}
                  </p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Nonce</p>
                  <p className="font-mono text-sm mt-1">{selectedTx.nonce}</p>
                </div>
              </div>

              {selectedTx.input_data && selectedTx.input_data !== "0x" && (
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Input Data</p>
                  <div className="p-3 rounded-sm bg-background border border-border overflow-x-auto">
                    <p className="font-mono text-xs break-all">{selectedTx.input_data}</p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-sm bg-background border border-border">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Timestamp</p>
                <p className="font-mono text-sm mt-1">{formatTimestamp(selectedTx.timestamp)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
