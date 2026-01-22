import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Blocks,
  ArrowRightLeft,
  Wallet,
  Send,
  Settings,
  Server,
  Shield,
  Radio
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Blocks", href: "/blocks", icon: Blocks },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Send TX", href: "/send", icon: Send },
  { name: "Node Info", href: "/node-info", icon: Settings },
];

const statusItems = [
  { name: "Geth Node", icon: Server },
  { name: "Lighthouse", icon: Radio },
  { name: "Clef Signer", icon: Shield },
];

export const Sidebar = () => {
  return (
    <aside
      data-testid="sidebar"
      className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-background/95 backdrop-blur-md flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center">
            <Blocks className="h-5 w-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-tight text-foreground">
              GETH PRIVATE
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
              BLOCKCHAIN MONITOR
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-3 px-3">
          NAVIGATION
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-sm font-mono text-xs uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" strokeWidth={1.5} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Status Section */}
      <div className="p-4 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider mb-3 px-3">
          NODE STATUS
        </p>
        {statusItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground"
          >
            <item.icon className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-mono text-xs">{item.name}</span>
            <div className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,153,0.6)] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Version */}
      <div className="p-4 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground tracking-wider text-center">
          v1.0.0 • GETH v1.14.12
        </p>
      </div>
    </aside>
  );
};
