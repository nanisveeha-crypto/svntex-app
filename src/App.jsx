
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage"; 
import UserDashboard from "./pages/UserDashboard";
import MyTeamPage from "./pages/MyTeamPage";
import PayoutsPage from "./pages/PayoutsPage";
import SupportPage from "./pages/SupportPage";
import MembersPage from "./pages/admin/MembersPage";
import KYCManagementPage from "./pages/admin/KYCManagementPage";
import SalesDataPage from "./pages/admin/SalesDataPage";
import TicketsPage from "./pages/admin/TicketsPage";
import MyEarningsPage from "./pages/MyEarningsPage";
import MemberPanel from "./components/MemberPanel";
import KYCPage from "./pages/KYCPage";
import ProfilePage from "./pages/ProfilePage";
import EditMemberPage from "./pages/EditMemberPage";
import JoinPage from "./pages/JoinPage"; // Import the new JoinPage
import ErrorBoundary from "./components/ErrorBoundary";
import Header from './components/Header';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple } from '@mui/material/colors';
import AdminNavbar from './components/admin/Navbar';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMembers from './pages/admin/Members';
import AdminSales from './pages/admin/Sales';
import ShopifyCreds from './components/ShopifyCreds';
import ShopifyProducts from './components/ShopifyProducts'; // Import the new component

const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500],
    },
  },
});

const AdminLayout = () => (
  <div>
    <AdminNavbar />
    <Outlet />
  </div>
);

const AppContent = () => {
  const location = useLocation();
  // Hide header on login, signup, root path, admin pages, and the new join page
  const showHeader = !['/login', '/signup', '/', '/join'].includes(location.pathname) && !location.pathname.startsWith('/admin');

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/join" element={<JoinPage />} /> {/* Add the new join route */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/team" element={<MyTeamPage />} />
        <Route path="/payouts" element={<PayoutsPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Admin Routes with the new Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="kyc" element={<KYCManagementPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="member/:memberId" element={<EditMemberPage />} />
          <Route path="shopify" element={<ShopifyCreds />} />
          <Route path="products" element={<ShopifyProducts />} /> {/* Add the new products route */}
        </Route>
        
        {/* Member Routes */}
        <Route 
          path="/member" 
          element={
            <ErrorBoundary>
              <MemberPanel />
            </ErrorBoundary>
          }
        />
        <Route path="/earnings" element={<MyEarningsPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/kyc-update" element={<KYCPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
