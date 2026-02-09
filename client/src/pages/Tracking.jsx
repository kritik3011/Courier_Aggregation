import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackingAPI } from '../services/api';
import { Card, StatusBadge, Button, Skeleton } from '../components/UI';
import { HiOutlineSearch, HiOutlineTruck } from 'react-icons/hi';
import { format } from 'date-fns';

export default function Tracking() {
  const { trackingId: urlTrackingId } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(urlTrackingId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlTrackingId) {
      handleTrack(urlTrackingId);
    }
  }, [urlTrackingId]);

  const handleTrack = async (id) => {
    const searchId = id || trackingId;
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await trackingAPI.track(searchId.trim());
      setResult(res.data.data);
      if (!urlTrackingId || urlTrackingId !== searchId) {
        navigate(`/track/${searchId.trim()}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack();
  };

  const statusIcons = {
    order_created: { icon: '📦', color: 'bg-blue-500' },
    pickup_scheduled: { icon: '📅', color: 'bg-cyan-500' },
    picked_up: { icon: '🚛', color: 'bg-purple-500' },
    in_transit: { icon: '✈️', color: 'bg-primary-500' },
    reached_hub: { icon: '🏢', color: 'bg-indigo-500' },
    out_for_delivery: { icon: '🚚', color: 'bg-pink-500' },
    delivered: { icon: '✅', color: 'bg-green-500' },
    failed_attempt: { icon: '❌', color: 'bg-red-500' },
    returned: { icon: '↩️', color: 'bg-orange-500' },
    cancelled: { icon: '🚫', color: 'bg-gray-500' }
  };

  const getStatusStep = (status) => {
    const steps = ['order_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = steps.findIndex(s => 
      status === s || 
      (status === 'pickup_scheduled' && s === 'order_created') ||
      (status === 'confirmed' && s === 'order_created') ||
      (status === 'reached_hub' && s === 'in_transit')
    );
    return Math.max(0, currentIndex);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <HiOutlineTruck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Track Your Shipment</h1>
          </div>
          <p className="text-dark-400">Enter your tracking ID to get real-time updates</p>
        </div>

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter tracking ID (e.g., DEL1234ABCD)"
                className="input pl-12 text-lg"
              />
            </div>
            <Button type="submit" loading={loading}>
              Track
            </Button>
          </form>
        </Card>

        {/* Error */}
        {error && (
          <Card className="max-w-2xl mx-auto bg-red-500/10 border-red-500/30">
            <p className="text-red-400 text-center">{error}</p>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6 animate-slide-up">
            {/* Status Overview */}
            <Card className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-dark-400 text-sm">Tracking ID</p>
                  <p className="text-2xl font-mono font-bold text-dark-100">{result.trackingId}</p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  {['Order Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].map((step, index) => {
                    const currentStep = getStatusStep(result.status);
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    
                    return (
                      <div key={index} className="flex-1 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-primary-500' : 'bg-dark-700'
                          } ${isCurrent ? 'ring-4 ring-primary-500/30' : ''}`}>
                            {isCompleted && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-primary-400' : 'text-dark-500'}`}>
                            {step}
                          </p>
                        </div>
                        {index < 4 && (
                          <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                            index < currentStep ? 'bg-primary-500' : 'bg-dark-700'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-dark-700">
                <div>
                  <p className="text-sm text-dark-400">Courier</p>
                  <p className="font-medium text-dark-100">{result.courier}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">From</p>
                  <p className="font-medium text-dark-100">{result.sender?.city}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">To</p>
                  <p className="font-medium text-dark-100">{result.receiver?.city}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">Expected</p>
                  <p className="font-medium text-dark-100">
                    {result.expectedDeliveryDate 
                      ? format(new Date(result.expectedDeliveryDate), 'MMM d, yyyy')
                      : '-'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-dark-100 mb-6">Tracking History</h3>
              {result.timeline && result.timeline.length > 0 ? (
                <div className="space-y-6">
                  {[...result.timeline].reverse().map((event, index) => {
                    const statusInfo = statusIcons[event.status] || { icon: '📍', color: 'bg-dark-600' };
                    const isLatest = index === 0;
                    
                    return (
                      <div key={index} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full ${statusInfo.color} flex items-center justify-center flex-shrink-0 ${
                          isLatest ? 'ring-4 ring-offset-2 ring-offset-dark-900 ring-opacity-30' : ''
                        }`} style={{ '--tw-ring-color': isLatest ? statusInfo.color.replace('bg-', '') : undefined }}>
                          <span className="text-lg">{statusInfo.icon}</span>
                        </div>
                        <div className="flex-1 pb-6 border-l-2 border-dark-700 pl-6 -ml-5">
                          <p className={`font-medium ${isLatest ? 'text-dark-100' : 'text-dark-300'}`}>
                            {event.description}
                          </p>
                          {event.location?.city && (
                            <p className="text-sm text-dark-400 mt-1">
                              📍 {event.location.city}, {event.location.state}
                            </p>
                          )}
                          <p className="text-xs text-dark-500 mt-2">
                            {format(new Date(event.timestamp), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-dark-400 text-center py-8">No tracking updates available</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
