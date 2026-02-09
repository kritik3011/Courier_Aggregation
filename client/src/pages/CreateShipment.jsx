import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shipmentsAPI, couriersAPI } from '../services/api';
import { Card, Button, Input, Select } from '../components/UI';
import { HiOutlineArrowLeft, HiOutlineTruck, HiOutlineUser, HiOutlineCube, HiOutlineCurrencyRupee } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function CreateShipment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couriers, setCouriers] = useState([]);
  const [step, setStep] = useState(1);
  const [comparison, setComparison] = useState(null);

  const [formData, setFormData] = useState({
    sender: { name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' },
    receiver: { name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' },
    package: { weight: '', length: '', width: '', height: '', description: '', value: '', category: 'other' },
    courier: '',
    serviceType: 'standard',
    paymentMode: 'prepaid',
    codAmount: 0
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

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const compareRates = async () => {
    try {
      const res = await couriersAPI.compare({
        weight: parseFloat(formData.package.weight) || 1,
        serviceType: formData.serviceType,
        paymentMode: formData.paymentMode
      });
      setComparison(res.data.data);
    } catch (err) {
      console.error('Error comparing rates:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courier) {
      toast.error('Please select a courier');
      return;
    }

    setLoading(true);
    try {
      const shipmentData = {
        ...formData,
        package: {
          ...formData.package,
          weight: parseFloat(formData.package.weight),
          length: parseFloat(formData.package.length) || undefined,
          width: parseFloat(formData.package.width) || undefined,
          height: parseFloat(formData.package.height) || undefined,
          value: parseFloat(formData.package.value) || undefined
        },
        codAmount: formData.paymentMode === 'cod' ? parseFloat(formData.codAmount) : 0
      };

      const res = await shipmentsAPI.create(shipmentData);
      toast.success('Shipment created successfully!');
      navigate(`/shipments/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating shipment');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-primary-400" />
              Sender Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name *" value={formData.sender.name} onChange={(e) => handleChange('sender', 'name', e.target.value)} required />
              <Input label="Phone *" value={formData.sender.phone} onChange={(e) => handleChange('sender', 'phone', e.target.value)} required />
              <Input label="Email" type="email" value={formData.sender.email} onChange={(e) => handleChange('sender', 'email', e.target.value)} />
              <Input label="Address *" value={formData.sender.address} onChange={(e) => handleChange('sender', 'address', e.target.value)} required />
              <Input label="City *" value={formData.sender.city} onChange={(e) => handleChange('sender', 'city', e.target.value)} required />
              <Input label="State *" value={formData.sender.state} onChange={(e) => handleChange('sender', 'state', e.target.value)} required />
              <Input label="Pincode *" value={formData.sender.pincode} onChange={(e) => handleChange('sender', 'pincode', e.target.value)} required />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <HiOutlineUser className="w-5 h-5 text-primary-400" />
              Receiver Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name *" value={formData.receiver.name} onChange={(e) => handleChange('receiver', 'name', e.target.value)} required />
              <Input label="Phone *" value={formData.receiver.phone} onChange={(e) => handleChange('receiver', 'phone', e.target.value)} required />
              <Input label="Email" type="email" value={formData.receiver.email} onChange={(e) => handleChange('receiver', 'email', e.target.value)} />
              <Input label="Address *" value={formData.receiver.address} onChange={(e) => handleChange('receiver', 'address', e.target.value)} required />
              <Input label="City *" value={formData.receiver.city} onChange={(e) => handleChange('receiver', 'city', e.target.value)} required />
              <Input label="State *" value={formData.receiver.state} onChange={(e) => handleChange('receiver', 'state', e.target.value)} required />
              <Input label="Pincode *" value={formData.receiver.pincode} onChange={(e) => handleChange('receiver', 'pincode', e.target.value)} required />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <HiOutlineCube className="w-5 h-5 text-primary-400" />
              Package Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Weight (kg) *" type="number" step="0.1" value={formData.package.weight} onChange={(e) => handleChange('package', 'weight', e.target.value)} required />
              <Input label="Declared Value (₹)" type="number" value={formData.package.value} onChange={(e) => handleChange('package', 'value', e.target.value)} />
              <Input label="Length (cm)" type="number" value={formData.package.length} onChange={(e) => handleChange('package', 'length', e.target.value)} />
              <Input label="Width (cm)" type="number" value={formData.package.width} onChange={(e) => handleChange('package', 'width', e.target.value)} />
              <Input label="Height (cm)" type="number" value={formData.package.height} onChange={(e) => handleChange('package', 'height', e.target.value)} />
              <Select label="Category" value={formData.package.category} onChange={(e) => handleChange('package', 'category', e.target.value)}>
                <option value="documents">Documents</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
                <option value="fragile">Fragile</option>
                <option value="other">Other</option>
              </Select>
              <div className="md:col-span-2">
                <Input label="Description" value={formData.package.description} onChange={(e) => handleChange('package', 'description', e.target.value)} placeholder="Brief description of contents" />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
              <HiOutlineTruck className="w-5 h-5 text-primary-400" />
              Select Courier
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Select label="Service Type" value={formData.serviceType} onChange={(e) => { handleChange(null, 'serviceType', e.target.value); compareRates(); }}>
                <option value="economy">Economy (4-6 days)</option>
                <option value="standard">Standard (2-4 days)</option>
                <option value="express">Express (1-2 days)</option>
                <option value="overnight">Overnight</option>
              </Select>
              <Select label="Payment Mode" value={formData.paymentMode} onChange={(e) => handleChange(null, 'paymentMode', e.target.value)}>
                <option value="prepaid">Prepaid</option>
                <option value="cod">Cash on Delivery</option>
              </Select>
            </div>

            {formData.paymentMode === 'cod' && (
              <Input label="COD Amount (₹)" type="number" value={formData.codAmount} onChange={(e) => handleChange(null, 'codAmount', e.target.value)} />
            )}

            <Button variant="secondary" onClick={compareRates} className="mb-4">
              Compare Courier Rates
            </Button>

            {comparison && (
              <div className="space-y-4">
                {comparison.comparison.map((item, index) => (
                  <div
                    key={item.courier.id}
                    onClick={() => handleChange(null, 'courier', item.courier.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.courier === item.courier.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
                          <HiOutlineTruck className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark-100">{item.courier.name}</p>
                          <p className="text-sm text-dark-400">{item.estimatedDays} days delivery</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-dark-100">₹{item.rate}</p>
                        <p className="text-sm text-dark-400">{item.successRate}% success rate</p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Cheapest Option
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!comparison && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {couriers.map((courier) => (
                  <div
                    key={courier._id}
                    onClick={() => handleChange(null, 'courier', courier._id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.courier === courier._id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mx-auto mb-3">
                        <HiOutlineTruck className="w-6 h-6 text-primary-400" />
                      </div>
                      <p className="font-semibold text-dark-100">{courier.name}</p>
                      <p className="text-sm text-dark-400">{courier.performance?.avgDeliveryDays} days avg.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/shipments')} className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Create New Shipment</h1>
          <p className="text-dark-400">Fill in the details to create a shipment</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => setStep(s)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                step === s
                  ? 'bg-primary-500 text-white'
                  : step > s
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              {s}
            </button>
            {s < 4 && (
              <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-primary-500' : 'bg-dark-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card>
        <form onSubmit={handleSubmit}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-dark-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            ) : (
              <Button type="submit" loading={loading}>
                Create Shipment
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
