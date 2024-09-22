import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const isLoggedIn = localStorage.getItem('role') !== null; // Vérifie si l'utilisateur est connecté

  // Si l'utilisateur est connecté, afficher le contenu protégé via Outlet, sinon rediriger vers /login
  return isLoggedIn ? <Outlet /> : <Navigate to="/mylogin" replace />;
};

export default PrivateRoute;
