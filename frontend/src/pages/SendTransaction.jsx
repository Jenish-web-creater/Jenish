import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Send, Shield, AlertCircle, CheckCircle, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const SendTransaction = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState(null);
  
  const [formData, setFormData] = useState({
    from_address: "",
    to_address: "",
    value: "",
    gas: "21000",
    data: "0x",
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API}/accounts`);
      setAccounts(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, from_address: res.data[0].address }));
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch accounts");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.from_address) {
      toast.error("Please select a sender account");
      return false;
    }
    if (!formData.to_address || !formData.to_address.startsWith("0x")) {
      toast.error("Please enter a valid recipient address");
      return false;
    }
    if (!formData.value || isNaN(parseFloat(formData.value))) {
      toast.error("Please enter a valid amount");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setTxResult(null);
    
    try {
      const res = await axios.post(`${API}/transactions`, {
        from_address: formData.from_address,
        to_address: formData.to_address,
        value: `${formData.value} ETH`,
        gas: parseInt(formData.gas),
        data: formData.data,
      });
      
      setTxResult({
        success: true,
        hash: res.data.hash,
        status: res.data.status,
      });
      
      toast.success("Transaction signed and sent via Clef!");
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        to_address: "",
        value: "",
        data: "0x",
      }));
      
    } catch (error) {
      console.error("Error sending transaction:", error);
      setTxResult({
        success: false,
        error: error.response?.data?.detail || "Transaction failed",
      });
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "---";
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const selectedAccount = accounts.find(acc => acc.address === formData.from_address);

  return (
    <div data-testid="send-transaction-page" className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-mono text-2xl font-bold tracking-tight">Send Transaction</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">
          Create and sign transactions via Clef signer
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="col-span-2">
          <Card className="border-border bg-card/40">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                <Send className="h-4 w-4" strokeWidth={1.5} />
                New Transaction
              </CardTitle>
              <CardDescription className="font-mono text-xs text-muted-foreground">
                Fill in the transaction details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* From Address */}
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    From (Clef Account)
                  </Label>
                  <Select
                    value={formData.from_address}
                    onValueChange={(value) => handleInputChange("from_address", value)}
                  >
                    <SelectTrigger data-testid="from-address-select" className="font-mono text-xs bg-background border-border">
                      <SelectValue placeholder="Select sender account" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {accounts.map((account) => (
                        <SelectItem key={account.address} value={account.address} className="font-mono text-xs">
                          {truncateAddress(account.address)} ({account.balance})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To Address */}
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    To (Recipient Address)
                  </Label>
                  <Input
                    data-testid="to-address-input"
                    placeholder="0x..."
                    value={formData.to_address}
                    onChange={(e) => handleInputChange("to_address", e.target.value)}
                    className="font-mono text-xs bg-background border-border"
                  />
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Value (ETH)
                  </Label>
                  <Input
                    data-testid="value-input"
                    type="number"
                    step="0.0001"
                    placeholder="0.0"
                    value={formData.value}
                    onChange={(e) => handleInputChange("value", e.target.value)}
                    className="font-mono text-xs bg-background border-border"
                  />
                </div>

                {/* Gas Limit */}
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Gas Limit
                  </Label>
                  <Input
                    data-testid="gas-input"
                    type="number"
                    value={formData.gas}
                    onChange={(e) => handleInputChange("gas", e.target.value)}
                    className="font-mono text-xs bg-background border-border"
                  />
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Input Data (Optional)
                  </Label>
                  <Textarea
                    data-testid="data-input"
                    placeholder="0x"
                    value={formData.data}
                    onChange={(e) => handleInputChange("data", e.target.value)}
                    className="font-mono text-xs bg-background border-border min-h-[80px]"
                  />
                </div>

                <Button
                  data-testid="send-tx-button"
                  type="submit"
                  disabled={loading}
                  className="w-full font-mono text-xs uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} />
                      Signing via Clef...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Sign & Send Transaction
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Transaction Result */}
          {txResult && (
            <Card className={`mt-4 border-border ${txResult.success ? "bg-primary/5" : "bg-destructive/5"}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {txResult.success ? (
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" strokeWidth={1.5} />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" strokeWidth={1.5} />
                  )}
                  <div className="flex-1">
                    <p className="font-mono text-sm font-semibold">
                      {txResult.success ? "Transaction Sent" : "Transaction Failed"}
                    </p>
                    {txResult.success ? (
                      <div className="mt-2 space-y-1">
                        <p className="font-mono text-xs text-muted-foreground">Transaction Hash:</p>
                        <p className="font-mono text-xs break-all text-primary">{txResult.hash}</p>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase mt-2">
                          Status: {txResult.status}
                        </p>
                      </div>
                    ) : (
                      <p className="font-mono text-xs text-destructive mt-1">{txResult.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Selected Account Info */}
          {selectedAccount && (
            <Card className="border-border bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Sender Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Address</p>
                    <p className="font-mono text-xs truncate mt-1">{selectedAccount.address}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase">Balance</p>
                      <p className="font-mono text-sm text-primary mt-1">{selectedAccount.balance}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase">Nonce</p>
                      <p className="font-mono text-sm mt-1">{selectedAccount.nonce}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clef Info */}
          <Card className="border-border bg-card/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" strokeWidth={1.5} />
                Clef Signer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,153,0.6)] animate-pulse" />
                  <span className="font-mono text-xs">Connected</span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  Transactions are signed externally via Clef for enhanced security.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Network Info */}
          <Card className="border-border bg-card/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Chain ID</span>
                  <span className="font-mono text-xs">1337</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Network</span>
                  <span className="font-mono text-xs">Private</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Gas Price</span>
                  <span className="font-mono text-xs">~20 Gwei</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
