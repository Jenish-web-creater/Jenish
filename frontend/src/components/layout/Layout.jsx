import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "../ui/sonner";

export const Layout = ({ children, blockchainStatus, onRefresh, isRefreshing }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header 
          blockchainStatus={blockchainStatus} 
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};
