import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard, StatusBadge, Card, Skeleton } from '../components/UI';
import { HiOutlineCube, HiOutlineTruck, HiOutlineCheck, HiOutlineX, HiOutlineCurrencyRupee, HiOutlinePlus, HiOutlineArrowRight } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [monthlyCosts, setMonthlyCosts] = useState([]);
  const [courierPerformance, setCourierPerformance] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, costsRes, performanceRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getMonthlyCosts(6),
        analyticsAPI.getCourierPerformance()
      ]);
      setStats(dashboardRes.data.data);
      setMonthlyCosts(costsRes.data.data);
      setCourierPerformance(performanceRes.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-dark-400 mt-1">Here's what's happening with your shipments</p>
        </div>
        <Link to="/shipments/new" className="btn-primary">
          <HiOutlinePlus className="w-5 h-5" />
          Create Shipment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shipments"
          value={stats?.counts?.total || 0}
          icon={HiOutlineCube}
          color="primary"
        />
        <StatCard
          title="In Transit"
          value={stats?.counts?.inTransit || 0}
          icon={HiOutlineTruck}
          color="blue"
        />
        <StatCard
          title="Delivered"
          value={stats?.counts?.delivered || 0}
          icon={HiOutlineCheck}
          color="green"
        />
        <StatCard
          title="Total Spent"
          value={`₹${(stats?.costs?.total || 0).toLocaleString()}`}
          icon={HiOutlineCurrencyRupee}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Costs Chart */}
        <Card>
          <div className="card-header">
            <h3 className="card-title">Monthly Shipping Costs</h3>
            <Link to="/analytics" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View Details <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCosts}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']}
                />
                <Area type="monotone" dataKey="totalCost" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Courier Distribution */}
        <Card>
          <div className="card-header">
            <h3 className="card-title">Courier Distribution</h3>
          </div>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={courierPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalShipments"
                >
                  {courierPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value, name, props) => [value, props.payload.courierName]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {courierPerformance.map((courier, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div className="flex-1">
                    <p className="text-sm text-dark-200">{courier.courierName}</p>
                    <p className="text-xs text-dark-400">{courier.totalShipments} shipments</p>
                  </div>
                  <span className="text-sm font-medium text-dark-300">
                    {Math.round(courier.successRate)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card>
        <div className="card-header">
          <h3 className="card-title">Recent Shipments</h3>
          <Link to="/shipments" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View All <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Recipient</th>
                <th>Destination</th>
                <th>Courier</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentShipments?.map((shipment) => (
                <tr key={shipment._id}>
                  <td>
                    <Link to={`/shipments/${shipment._id}`} className="text-primary-400 hover:text-primary-300 font-mono">
                      {shipment.trackingId}
                    </Link>
                  </td>
                  <td className="text-dark-200">{shipment.receiver?.name}</td>
                  <td className="text-dark-300">{shipment.receiver?.city}</td>
                  <td className="text-dark-300">{shipment.courierName}</td>
                  <td><StatusBadge status={shipment.status} /></td>
                  <td className="text-dark-200 font-medium">₹{shipment.totalCost}</td>
                </tr>
              ))}
              {(!stats?.recentShipments || stats.recentShipments.length === 0) && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-dark-400">
                    No shipments yet. Create your first shipment!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/shipments/new" className="glass-card-hover p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlinePlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-dark-100">New Shipment</h4>
              <p className="text-sm text-dark-400">Create a new shipment</p>
            </div>
          </div>
        </Link>

        <Link to="/compare" className="glass-card-hover p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-dark-100">Compare Rates</h4>
              <p className="text-sm text-dark-400">Find the best courier</p>
            </div>
          </div>
        </Link>

        <Link to="/track" className="glass-card-hover p-6 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HiOutlineTruck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-dark-100">Track Shipment</h4>
              <p className="text-sm text-dark-400">Real-time tracking</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
