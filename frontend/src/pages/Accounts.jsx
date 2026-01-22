import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
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
import { Wallet, Copy, ExternalLink, Shield, User } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/accounts`);
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const viewAccountDetails = async (address) => {
    try {
      const res = await axios.get(`${API}/accounts/${address}`);
      setSelectedAccount(res.data);
      setDialogOpen(true);
    } catch (error) {
      toast.error("Failed to fetch account details");
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "---";
    return `${address.slice(0, 14)}...${address.slice(-10)}`;
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
    <div data-testid="accounts-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Clef-managed accounts on the private network
          </p>
        </div>
      </div>

      {/* Clef Info Card */}
      <Card className="border-border bg-card/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-sm bg-primary/10">
              <Shield className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-mono text-sm font-semibold">Clef Signer</h3>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Managing {accounts.length} accounts • External signer for secure transaction signing
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card className="border-border bg-card/40">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" strokeWidth={1.5} />
            Managed Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground w-8">#</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Address</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Balance</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Nonce</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Type</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <span className="font-mono text-xs text-muted-foreground">Loading accounts...</span>
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <span className="font-mono text-xs text-muted-foreground">No accounts found</span>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account, index) => (
                  <TableRow key={account.address} className="border-border hover:bg-accent/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-sm bg-primary/10">
                          <User className="h-3 w-3 text-primary" strokeWidth={1.5} />
                        </div>
                        <span className="font-mono text-xs">{truncateAddress(account.address)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.address)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-primary">
                      {account.balance}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {account.nonce}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {account.is_contract ? "Contract" : "EOA"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        data-testid={`view-account-${index}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => viewAccountDetails(account.address)}
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
        </CardContent>
      </Card>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {accounts.map((account, index) => (
          <Card
            key={account.address}
            data-testid={`account-card-${index}`}
            className="border-border bg-card/40 hover:bg-card/60 transition-colors cursor-pointer"
            onClick={() => viewAccountDetails(account.address)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-sm bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  #{index + 1}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="font-mono text-xs text-muted-foreground">Address</p>
                <p className="font-mono text-sm mt-1 truncate">{account.address}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Balance</p>
                  <p className="font-mono text-sm text-primary">{account.balance}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">Nonce</p>
                  <p className="font-mono text-sm">{account.nonce}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Account Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg">Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Address</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs break-all">{selectedAccount.address}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedAccount.address)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Balance</p>
                  <p className="font-mono text-lg mt-1 text-primary">{selectedAccount.balance}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Nonce</p>
                  <p className="font-mono text-lg mt-1">{selectedAccount.nonce}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                  <p className="font-mono text-sm mt-1">{selectedAccount.is_contract ? "Contract" : "Externally Owned Account (EOA)"}</p>
                </div>
                <div className="p-3 rounded-sm bg-background border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Created</p>
                  <p className="font-mono text-xs mt-1">{formatTimestamp(selectedAccount.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
