import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shipmentsAPI } from '../services/api';
import { Card, StatusBadge, Button, Skeleton } from '../components/UI';
import { HiOutlineArrowLeft, HiOutlinePrinter, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shipment, setShipment] = useState(null);
  const [trackingLogs, setTrackingLogs] = useState([]);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const res = await shipmentsAPI.getOne(id);
      setShipment(res.data.data);
      setTrackingLogs(res.data.trackingLogs || []);
    } catch (err) {
      console.error('Error fetching shipment:', err);
      toast.error('Shipment not found');
      navigate('/shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLabel = async () => {
    try {
      await shipmentsAPI.generateLabel(id);
      toast.success('Label generated!');
      fetchShipment();
    } catch (err) {
      toast.error('Error generating label');
    }
  };

  const statusIcons = {
    order_created: '📦',
    pickup_scheduled: '📅',
    picked_up: '🚛',
    in_transit: '✈️',
    reached_hub: '🏢',
    out_for_delivery: '🚚',
    delivered: '✅',
    failed_attempt: '❌',
    returned: '↩️',
    cancelled: '🚫'
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!shipment) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/shipments')} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100">
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-dark-100 font-mono">{shipment.trackingId}</h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-dark-400 mt-1">Created {format(new Date(shipment.createdAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleGenerateLabel}>
            <HiOutlinePrinter className="w-5 h-5" />
            Print Label
          </Button>
          <Link to={`/track/${shipment.trackingId}`} className="btn-primary">
            Track Shipment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sender & Receiver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Sender</h3>
              <div className="space-y-3">
                <p className="font-medium text-dark-100">{shipment.sender.name}</p>
                <div className="flex items-center gap-2 text-dark-300">
                  <HiOutlinePhone className="w-4 h-4" />
                  {shipment.sender.phone}
                </div>
                {shipment.sender.email && (
                  <div className="flex items-center gap-2 text-dark-300">
                    <HiOutlineMail className="w-4 h-4" />
                    {shipment.sender.email}
                  </div>
                )}
                <div className="flex items-start gap-2 text-dark-300">
                  <HiOutlineLocationMarker className="w-4 h-4 mt-1" />
                  <div>
                    <p>{shipment.sender.address}</p>
                    <p>{shipment.sender.city}, {shipment.sender.state} - {shipment.sender.pincode}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Receiver</h3>
              <div className="space-y-3">
                <p className="font-medium text-dark-100">{shipment.receiver.name}</p>
                <div className="flex items-center gap-2 text-dark-300">
                  <HiOutlinePhone className="w-4 h-4" />
                  {shipment.receiver.phone}
                </div>
                {shipment.receiver.email && (
                  <div className="flex items-center gap-2 text-dark-300">
                    <HiOutlineMail className="w-4 h-4" />
                    {shipment.receiver.email}
                  </div>
                )}
                <div className="flex items-start gap-2 text-dark-300">
                  <HiOutlineLocationMarker className="w-4 h-4 mt-1" />
                  <div>
                    <p>{shipment.receiver.address}</p>
                    <p>{shipment.receiver.city}, {shipment.receiver.state} - {shipment.receiver.pincode}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Package Details */}
          <Card>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Package Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-dark-400">Weight</p>
                <p className="font-medium text-dark-100">{shipment.package.weight} kg</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Dimensions</p>
                <p className="font-medium text-dark-100">
                  {shipment.package.length || '-'} x {shipment.package.width || '-'} x {shipment.package.height || '-'} cm
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Category</p>
                <p className="font-medium text-dark-100 capitalize">{shipment.package.category}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Declared Value</p>
                <p className="font-medium text-dark-100">₹{shipment.package.value || 0}</p>
              </div>
            </div>
            {shipment.package.description && (
              <div className="mt-4 pt-4 border-t border-dark-700">
                <p className="text-sm text-dark-400">Description</p>
                <p className="text-dark-200">{shipment.package.description}</p>
              </div>
            )}
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <h3 className="text-lg font-semibold text-dark-100 mb-6">Tracking History</h3>
            {trackingLogs.length > 0 ? (
              <div className="timeline">
                {trackingLogs.map((log, index) => (
                  <div key={log._id} className="timeline-item">
                    <div className={`timeline-dot ${index === trackingLogs.length - 1 ? 'active' : ''}`} />
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{statusIcons[log.status] || '📍'}</span>
                        <p className="font-medium text-dark-100">{log.description}</p>
                      </div>
                      {log.location?.city && (
                        <p className="text-sm text-dark-400 mt-1">
                          {log.location.city}, {log.location.state}
                        </p>
                      )}
                      <p className="text-xs text-dark-500 mt-1">
                        {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-center py-8">No tracking updates yet</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Info */}
          <Card>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Shipping Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-dark-400">Courier</p>
                <p className="font-medium text-dark-100">{shipment.courierName}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Service Type</p>
                <p className="font-medium text-dark-100 capitalize">{shipment.serviceType}</p>
              </div>
              <div>
                <p className="text-sm text-dark-400">Payment Mode</p>
                <p className="font-medium text-dark-100 uppercase">{shipment.paymentMode}</p>
              </div>
              {shipment.paymentMode === 'cod' && (
                <div>
                  <p className="text-sm text-dark-400">COD Amount</p>
                  <p className="font-medium text-dark-100">₹{shipment.codAmount}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-400">Shipping Cost</span>
                <span className="text-dark-100">₹{shipment.shippingCost}</span>
              </div>
              {shipment.insuranceCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Insurance</span>
                  <span className="text-dark-100">₹{shipment.insuranceCost}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-dark-700">
                <span className="font-semibold text-dark-100">Total</span>
                <span className="font-bold text-xl text-primary-400">₹{shipment.totalCost}</span>
              </div>
            </div>
          </Card>

          {/* Key Dates */}
          <Card>
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Key Dates</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <HiOutlineCalendar className="w-5 h-5 text-dark-400" />
                <div>
                  <p className="text-sm text-dark-400">Created</p>
                  <p className="text-dark-100">{format(new Date(shipment.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              {shipment.pickupDate && (
                <div className="flex items-center gap-3">
                  <HiOutlineCalendar className="w-5 h-5 text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-400">Pickup Scheduled</p>
                    <p className="text-dark-100">{format(new Date(shipment.pickupDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              {shipment.expectedDeliveryDate && (
                <div className="flex items-center gap-3">
                  <HiOutlineCalendar className="w-5 h-5 text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-400">Expected Delivery</p>
                    <p className="text-dark-100">{format(new Date(shipment.expectedDeliveryDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              {shipment.actualDeliveryDate && (
                <div className="flex items-center gap-3">
                  <HiOutlineCalendar className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-dark-400">Delivered</p>
                    <p className="text-green-400">{format(new Date(shipment.actualDeliveryDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
