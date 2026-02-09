import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Card, Skeleton } from '../components/UI';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineClock, HiOutlineTruck } from 'react-icons/hi';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [monthlyCosts, setMonthlyCosts] = useState([]);
  const [courierPerformance, setCourierPerformance] = useState([]);
  const [successRate, setSuccessRate] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [costsRes, performanceRes, successRes, deliveryRes] = await Promise.all([
        analyticsAPI.getMonthlyCosts(12),
        analyticsAPI.getCourierPerformance(),
        analyticsAPI.getSuccessRate(6),
        analyticsAPI.getDeliveryTime()
      ]);
      setMonthlyCosts(costsRes.data.data);
      setCourierPerformance(performanceRes.data.data);
      setSuccessRate(successRes.data.data);
      setDeliveryTime(deliveryRes.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
          <HiOutlineChartBar className="w-8 h-8 text-primary-400" />
          Analytics & Reports
        </h1>
        <p className="text-dark-400 mt-1">Track your shipping performance and costs</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Shipping Costs */}
        <Card>
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-primary-400" />
              Monthly Shipping Costs
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCosts}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']}
                />
                <Area type="monotone" dataKey="totalCost" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Courier Performance */}
        <Card>
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <HiOutlineTruck className="w-5 h-5 text-primary-400" />
              Courier Performance
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courierPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="courierName" stroke="#64748b" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="totalShipments" name="Total Shipments" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="deliveredCount" name="Delivered" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Success Rate Trend */}
        <Card>
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <HiOutlineTrendingUp className="w-5 h-5 text-green-400" />
              Delivery Success Rate
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={successRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`, 'Success Rate']}
                />
                <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Average Delivery Time */}
        <Card>
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <HiOutlineClock className="w-5 h-5 text-cyan-400" />
              Avg. Delivery Time by Courier
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="courier" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}d`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value) => [`${value} days`, 'Avg. Delivery']}
                />
                <Bar dataKey="avgDays" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                  {deliveryTime.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <div className="card-header">
          <h3 className="card-title">Courier Summary</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Courier</th>
                <th>Total Shipments</th>
                <th>Delivered</th>
                <th>Success Rate</th>
                <th>Avg. Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {courierPerformance.map((courier, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium text-dark-100">{courier.courierName}</span>
                    </div>
                  </td>
                  <td className="text-dark-200">{courier.totalShipments}</td>
                  <td className="text-dark-200">{courier.deliveredCount}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{ width: `${courier.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-dark-300">{Math.round(courier.successRate)}%</span>
                    </div>
                  </td>
                  <td className="text-dark-200">₹{courier.avgCost}</td>
                  <td className="font-medium text-dark-100">₹{Math.round(courier.totalCost).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
