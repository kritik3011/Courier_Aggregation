import { useState, useEffect } from 'react';
import { couriersAPI } from '../services/api';
import { Card, Button, Input, Select } from '../components/UI';
import { HiOutlineScale, HiOutlineTruck, HiOutlineClock, HiOutlineStar, HiOutlineCheck, HiOutlineLightningBolt } from 'react-icons/hi';

export default function CourierComparison() {
  const [loading, setLoading] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [formData, setFormData] = useState({
    weight: 1,
    serviceType: 'standard',
    paymentMode: 'prepaid',
    fromPincode: '',
    toPincode: ''
  });

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const res = await couriersAPI.getAll(true);
      setCouriers(res.data.data);
    } catch (err) {
      console.error('Error fetching couriers:', err);
    }
  };

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await couriersAPI.compare(formData);
      setComparison(res.data.data);
    } catch (err) {
      console.error('Error comparing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
          <HiOutlineScale className="w-8 h-8 text-primary-400" />
          Compare Courier Rates
        </h1>
        <p className="text-dark-400 mt-1">Find the best courier for your shipment</p>
      </div>

      {/* Input Form */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Select
              label="Service Type"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            >
              <option value="economy">Economy</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="overnight">Overnight</option>
            </Select>
          </div>
          <div>
            <Select
              label="Payment Mode"
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
            >
              <option value="prepaid">Prepaid</option>
              <option value="cod">Cash on Delivery</option>
            </Select>
          </div>
          <div>
            <Input
              label="From Pincode"
              placeholder="400001"
              value={formData.fromPincode}
              onChange={(e) => setFormData({ ...formData, fromPincode: e.target.value })}
            />
          </div>
          <div>
            <Input
              label="To Pincode"
              placeholder="110001"
              value={formData.toPincode}
              onChange={(e) => setFormData({ ...formData, toPincode: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleCompare} loading={loading}>
            <HiOutlineScale className="w-5 h-5" />
            Compare Rates
          </Button>
        </div>
      </Card>

      {/* Recommendations */}
      {comparison?.recommendations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <HiOutlineCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Cheapest</p>
                <p className="font-semibold text-dark-100">{comparison.recommendations.cheapest.courier.name}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-400">₹{comparison.recommendations.cheapest.rate}</p>
            <p className="text-sm text-dark-400 mt-2">{comparison.recommendations.cheapest.reason}</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <HiOutlineLightningBolt className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Fastest</p>
                <p className="font-semibold text-dark-100">{comparison.recommendations.fastest.courier.name}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-400">{comparison.recommendations.fastest.estimatedDays} days</p>
            <p className="text-sm text-dark-400 mt-2">{comparison.recommendations.fastest.reason}</p>
          </Card>

          <Card className="bg-gradient-to-br from-primary-500/10 to-primary-600/5 border-primary-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                <HiOutlineStar className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Recommended</p>
                <p className="font-semibold text-dark-100">{comparison.recommendations.recommended.courier.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary-400">{comparison.recommendations.recommended.rating}</span>
              <HiOutlineStar className="w-6 h-6 text-primary-400" />
            </div>
            <p className="text-sm text-dark-400 mt-2">{comparison.recommendations.recommended.reason}</p>
          </Card>
        </div>
      )}

      {/* Full Comparison */}
      {comparison?.comparison && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Detailed Comparison</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Courier</th>
                  <th>Rate</th>
                  <th>Delivery Time</th>
                  <th>Success Rate</th>
                  <th>Rating</th>
                  <th>Features</th>
                </tr>
              </thead>
              <tbody>
                {comparison.comparison.map((item, index) => (
                  <tr key={item.courier.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                          <HiOutlineTruck className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-dark-100">{item.courier.name}</p>
                          <p className="text-xs text-dark-400">{item.courier.code}</p>
                        </div>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">Best Price</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-xl font-bold text-dark-100">₹{item.rate}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <HiOutlineClock className="w-4 h-4 text-dark-400" />
                        <span className="text-dark-200">{item.estimatedDays} days</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                            style={{ width: `${item.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-dark-300">{item.successRate}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-dark-200">{item.rating}</span>
                        <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {item.features?.tracking && (
                          <span className="px-2 py-1 text-xs bg-dark-700 text-dark-300 rounded">Tracking</span>
                        )}
                        {item.features?.insurance && (
                          <span className="px-2 py-1 text-xs bg-dark-700 text-dark-300 rounded">Insurance</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* All Couriers */}
      {!comparison && couriers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {couriers.map((courier) => (
            <Card key={courier._id} className="hover:border-primary-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center">
                  <HiOutlineTruck className="w-7 h-7 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-100">{courier.name}</h3>
                  <p className="text-sm text-dark-400">{courier.code}</p>
                </div>
              </div>
              <p className="text-sm text-dark-300 mb-4">{courier.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Avg. Delivery</span>
                  <span className="text-dark-200">{courier.performance?.avgDeliveryDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Success Rate</span>
                  <span className="text-dark-200">{courier.performance?.deliverySuccessRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Base Rate</span>
                  <span className="text-dark-200">₹{courier.pricing?.baseRate}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
