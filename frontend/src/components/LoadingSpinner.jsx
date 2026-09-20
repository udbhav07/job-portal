import { LogoMark } from "./Logo";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center ">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-700 mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoMark className="w-7 h-7" />
          </div>
        </div>
        <p className="text-gray-600 font-medium">
          Finding amazing opportunities...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
