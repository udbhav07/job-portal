import { LogoMark } from "../../../components/Logo";

const Footer = () => {
  return (
    <footer className="relative bg-gray-50 text-gray-900 overflow-hidden">
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer content */}
          <div className="text-center space-y-8">
            {/* Logo/Brand */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-6 cursor-pointer">
                <LogoMark className="w-10 h-10" />
                <h3 className="text-2xl font-bold text-gray-800">JobPortal</h3>
              </div>
              <p className={`text-sm text-gray-600 max-w-md mx-auto`}>
                Connecting talented professionals with innovative companies
                worldwide Your career success is our mission
              </p>
            </div>
            {/* Copyrights */}
            <div className="space-y-2">
              <p className={`text-sm text-gray-600`}>
                {`\u00A9`} {new Date().getFullYear()} JobPortal, India. All
                rights reversed.
              </p>
              <p className={`text-xs text-gray-500 cursor-pointer`}>
                Privacy Policy | Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
