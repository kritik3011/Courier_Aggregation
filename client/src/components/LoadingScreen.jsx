export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-dark-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary-400 animate-spin" style={{ animationDuration: '0.8s' }}></div>
        </div>
        <h2 className="text-xl font-semibold gradient-text">Loading...</h2>
        <p className="text-dark-400 mt-2">Please wait while we set things up</p>
      </div>
    </div>
  );
}
