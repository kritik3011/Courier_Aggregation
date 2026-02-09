import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { shipmentsAPI } from '../services/api';
import { StatusBadge, Card, Button, Skeleton, EmptyState } from '../components/UI';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineFilter, HiOutlineCube, HiOutlineDownload } from 'react-icons/hi';
import { format } from 'date-fns';

export default function Shipments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    search: ''
  });

  useEffect(() => {
    fetchShipments();
  }, [searchParams]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 10,
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined
      };
      const res = await shipmentsAPI.getAll(params);
      setShipments(res.data.data);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (err) {
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ page: 1, status: filters.status });
    fetchShipments();
  };

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status });
    setSearchParams({ page: 1, status });
  };

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Shipments</h1>
          <p className="text-dark-400 mt-1">Manage and track all your shipments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </Button>
          <Link to="/shipments/new" className="btn-primary">
            <HiOutlinePlus className="w-5 h-5" />
            New Shipment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by tracking ID, recipient..."
                className="input pl-12"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filters.status === status.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Shipments Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : shipments.length === 0 ? (
        <Card>
          <EmptyState
            icon={HiOutlineCube}
            title="No shipments found"
            description="Create your first shipment to get started"
            action={
              <Link to="/shipments/new" className="btn-primary">
                <HiOutlinePlus className="w-5 h-5" />
                Create Shipment
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Recipient</th>
                  <th>Destination</th>
                  <th>Courier</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment._id} className="cursor-pointer">
                    <td>
                      <Link to={`/shipments/${shipment._id}`} className="text-primary-400 hover:text-primary-300 font-mono font-medium">
                        {shipment.trackingId}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <p className="text-dark-100">{shipment.receiver?.name}</p>
                        <p className="text-xs text-dark-400">{shipment.receiver?.phone}</p>
                      </div>
                    </td>
                    <td className="text-dark-300">
                      {shipment.receiver?.city}, {shipment.receiver?.state}
                    </td>
                    <td>
                      <span className="font-medium text-dark-200">{shipment.courierName}</span>
                    </td>
                    <td>
                      <span className="capitalize text-dark-300">{shipment.serviceType}</span>
                    </td>
                    <td>
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="font-medium text-dark-100">₹{shipment.totalCost}</td>
                    <td className="text-dark-400 text-sm">
                      {format(new Date(shipment.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
              <p className="text-sm text-dark-400">
                Showing {shipments.length} of {pagination.total} shipments
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchParams({ page: pagination.page - 1, status: filters.status })}
                  disabled={pagination.page === 1}
                  className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-dark-300">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setSearchParams({ page: pagination.page + 1, status: filters.status })}
                  disabled={pagination.page === pagination.pages}
                  className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
