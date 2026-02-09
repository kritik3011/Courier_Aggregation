export function StatusBadge({ status }) {
  const statusMap = {
    pending: { label: 'Pending', class: 'badge-pending' },
    confirmed: { label: 'Confirmed', class: 'badge-confirmed' },
    picked_up: { label: 'Picked Up', class: 'badge-picked_up' },
    in_transit: { label: 'In Transit', class: 'badge-in_transit' },
    out_for_delivery: { label: 'Out for Delivery', class: 'badge-out_for_delivery' },
    delivered: { label: 'Delivered', class: 'badge-delivered' },
    failed: { label: 'Failed', class: 'badge-failed' },
    returned: { label: 'Returned', class: 'badge-returned' },
    cancelled: { label: 'Cancelled', class: 'badge-cancelled' }
  };

  const config = statusMap[status] || { label: status, class: 'badge' };

  return <span className={config.class}>{config.label}</span>;
}

export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`${hover ? 'glass-card-hover' : 'glass-card'} p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner w-4 h-4 mr-2" />}
      {children}
    </button>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className={`input ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <select className={`input ${error ? 'border-red-500' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`bg-dark-800 rounded-lg animate-pulse ${className}`}
      {...props}
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-800 flex items-center justify-center">
          <Icon className="w-8 h-8 text-dark-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-dark-200 mb-2">{title}</h3>
      <p className="text-dark-400 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500 to-primary-700',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700',
    yellow: 'from-yellow-500 to-yellow-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700'
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-dark-100">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
