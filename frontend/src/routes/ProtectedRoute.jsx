import { Outlet } from "react-router-dom";

// TODO: check login and role before rendering
const ProtectedRoute = () => {
  return <Outlet />;
};

export default ProtectedRoute;
