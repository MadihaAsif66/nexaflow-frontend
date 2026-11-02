import  CustomerManagement from "./customermanagement"
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, ShoppingBag, Package,
  BarChart3, Bell, Search, Menu, X, Zap,
  ArrowUpRight, Download, Activity, ShieldCheck
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, Cell,
  PieChart, Pie, ResponsiveContainer,
  Tooltip, XAxis, CartesianGrid
} from "recharts";

type Page = "Dashboard" | "Customers" | "Orders" | "Inventory";

const revenue = [
  { month: "Jan", value: 25 },
  { month: "Feb", value: 38 },
  { month: "Mar", value: 30 },
  { month: "Apr", value: 51 },
  { month: "May", value: 43 },
  { month: "Jun", value: 65 },
  { month: "Jul", value: 58 },
  { month: "Aug", value: 78 },
  { month: "Sep", value: 69 },
  { month: "Oct", value: 90 },
  { month: "Nov", value: 81 },
  { month: "Dec", value: 100 },
];

const weekly = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 85 },
  { day: "Wed", value: 72 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 80 },
  { day: "Sat", value: 55 },
  { day: "Sun", value: 70 },
];

const sources = [
  { name: "Direct", value: 42, color: "#9374ff" },
  { name: "Social", value: 28, color: "#32d5c5" },
  { name: "Referral", value: 18, color: "#48b8ff" },
  { name: "Other", value: 12, color: "#ffc56e" },
];

// const customers = [];

const orders = [
  { id: "NX-1042", customer: "Ayesha Khan", amount: 12500, status: "Completed" },
  { id: "NX-1041", customer: "Ali Ahmed", amount: 8500, status: "Processing" },
  { id: "NX-1040", customer: "Sara Malik", amount: 4200, status: "Pending" },
  { id: "NX-1039", customer: "Hamza Raza", amount: 3800, status: "Completed" },
];

const products = [
  { name: "Premium Headphones", stock: 42, price: 12500 },
  { name: "Smart Watch Pro", stock: 8, price: 8500 },
  { name: "Wireless Speaker", stock: 25, price: 4200 },
  { name: "USB-C Hub", stock: 5, price: 3800 },
];

const menu = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Customers", icon: Users },
  { name: "Orders", icon: ShoppingBag },
  { name: "Inventory", icon: Package },
] as const;

function Panel({
  title, subtitle, children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span className={`status ${
      value === "Completed" || value === "Active"
        ? "success"
        : value === "Processing"
        ? "info"
        : "warning"
    }`}>
      ● {value}
    </span>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("Backend offline");
        return response.json();
      })
      .then((data) => setBackendOnline(data.status === "healthy"))
      .catch(() => setBackendOnline(false));
  }, []);

  function navigate(next: Page) {
    setPage(next);
    setSearch("");
    setSidebarOpen(false);
  }

  function exportOrders() {
    const rows = [
      ["Order", "Customer", "Amount", "Status"],
      ...orders.map((o) => [
        o.id, o.customer, String(o.amount), o.status
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexaflow-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    { label: "Total Revenue", value: "PKR 2.48M", change: "+18.6%", icon: BarChart3, color: "purple" },
    { label: "Total Customers", value: "12,840", change: "+12.4%", icon: Users, color: "cyan" },
    { label: "Total Orders", value: "3,624", change: "+8.2%", icon: ShoppingBag, color: "pink" },
    { label: "Conversion Rate", value: "24.8%", change: "+4.3%", icon: Activity, color: "gold" },
  ];

  return (
    <div className="app">
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo">
          <span className="logo-icon"><Zap size={23} /></span>
          <div>
            <strong>NexaFlow<span className="accent">.</span></strong>
            <small>ANALYTICS STUDIO</small>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace">
          <span className="workspace-icon">N</span>
          <div>
            <strong>NexaFlow Studio</strong>
            <small>Premium Workspace</small>
          </div>
        </div>

        <p className="nav-label">GENERAL</p>
        <nav>
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${page === item.name ? "active" : ""}`}
                onClick={() => navigate(item.name)}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <p className="nav-label second-label">SYSTEM</p>
        <button className="nav-item" onClick={() => setNotifications(true)}>
          <Bell size={19} /> Notifications
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade">
            <span className="upgrade-icon">✦</span>
            <h3>Power your business</h3>
            <p>Smart automation and advanced analytics coming soon.</p>
            <span className="coming-soon">COMING SOON</span>
          </div>
          <div className="connection">
            <span className={backendOnline ? "dot green" : "dot red"} />
            {backendOnline ? "Backend Connected" : "Backend Offline"}
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button className="menu-button" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <span className="muted">/</span>
            <strong>{page}</strong>
          </div>

          <div className="top-actions">
            <span className="health">
              <span className={backendOnline ? "dot green" : "dot red"} />
              {backendOnline ? "Live system health" : "Backend offline"}
            </span>
            <button className="bell" onClick={() => setNotifications(!notifications)}>
              <Bell size={19} />
            </button>
            <span className="avatar">AD</span>
            <div className="profile">
              <strong>Admin Demo</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        {notifications && (
          <div className="notifications">
            <button onClick={() => setNotifications(false)}>✕</button>
            <h3>Notifications</h3>
            <p>🟣 New customer registered (demo)</p>
            <p>🟡 Low stock: Smart Watch Pro</p>
            <p>🟢 Order NX-1042 completed (demo)</p>
          </div>
        )}

        <main className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">✦ YOUR BUSINESS AT A GLANCE</p>
              <h1>{page === "Dashboard" ? "Overview Dashboard" : page}</h1>
              <p>Monitor your business performance and operations in one place.</p>
            </div>
            <button className="export-button" onClick={exportOrders}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          {page === "Dashboard" && (
            <>
              <div className="stats">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div className={`stat-card ${stat.color}`} key={stat.label}>
                      <div className="stat-heading">
                        <span>{stat.label}</span>
                        <Icon size={20} />
                      </div>
                      <h2>{stat.value}</h2>
                      <div className="stat-footer">
                        <span className="growth">
                          <ArrowUpRight size={14} /> {stat.change}
                        </span>
                        <span>vs last month</span>
                      </div>
                      <div className="stat-glow" />
                    </div>
                  );
                })}
              </div>

              <div className="analytics-grid">
                <Panel
                  title="Revenue Analytics"
                  subtitle="Monthly business performance"
                >
                  <div className="chart-summary">
                    <h2>PKR 2,480,560</h2>
                    <span className="growth">↗ 18.6%</span>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenue}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9875ff" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#9875ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#ffffff12" vertical={false} />
                        <XAxis dataKey="month" stroke="#9393b4" tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: "#24243d",
                            border: "1px solid #ffffff25",
                            borderRadius: 12,
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#a58aff"
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel
                  title="Weekly Activity"
                  subtitle="User engagement overview"
                >
                  <div className="chart-summary">
                    <h2>24,473</h2>
                    <span className="growth">↗ 12.8%</span>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekly}>
                        <XAxis dataKey="day" stroke="#9393b4" tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: "#ffffff10" }}
                          contentStyle={{
                            background: "#24243d",
                            border: "1px solid #ffffff25",
                            borderRadius: 12,
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {weekly.map((item, index) => (
                            <Cell
                              key={item.day}
                              fill={[
                                "#9875ff", "#40c8ec", "#31d1b7",
                                "#b4d86e", "#f5c16d", "#ef9a8b",
                                "#e17ac2"
                              ][index]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>

              <div className="bottom-grid">
                <Panel title="Revenue Source Mix" subtitle="Traffic distribution">
                  <div className="source-layout">
                    <div className="donut">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sources}
                            dataKey="value"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {sources.map((source) => (
                              <Cell key={source.name} fill={source.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="donut-center">
                        <strong>100%</strong>
                        <small>Total</small>
                      </div>
                    </div>

                    <div className="legend">
                      {sources.map((source) => (
                        <div key={source.name}>
                          <span>
                            <i style={{ background: source.color }} />
                            {source.name}
                          </span>
                          <strong>{source.value}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Recent Orders" subtitle="Latest transactions">
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>ORDER</th>
                          <th>CUSTOMER</th>
                          <th>AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="highlight">{order.id}</td>
                            <td>{order.customer}</td>
                            <td>PKR {order.amount.toLocaleString()}</td>
                            <td><Status value={order.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>

              <div className="system-banner">
                <ShieldCheck size={24} />
                <div>
                  <strong>System Connections</strong>
                  <p>
                    {backendOnline
                      ? "Express API connected successfully."
                      : "Start the Express server to connect your API."}
                    {" "}Business statistics currently use sample data.
                  </p>
                </div>
              </div>
            </>
          )}

          {page === "Customers" && (
            <CustomerManagement />
          )}

          {page === "Orders" && (
            <Panel title="Order Management" subtitle="Track customer orders">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="highlight">{order.id}</td>
                        <td>{order.customer}</td>
                        <td>PKR {order.amount.toLocaleString()}</td>
                        <td><Status value={order.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {page === "Inventory" && (
            <div className="inventory-grid">
              {products.map((product) => (
                <div className="panel product" key={product.name}>
                  <Package size={27} color="#a58aff" />
                  <h3>{product.name}</h3>
                  <p>PKR {product.price.toLocaleString()}</p>
                  <Status value={product.stock < 10 ? "Low Stock" : "Active"} />
                  <p>{product.stock} units available</p>
                </div>
              ))}
            </div>
          )}

          <footer>© 2026 NexaFlow Studio · Premium Dashboard Demo</footer>
        </main>
      </div>
    </div>
  );
}