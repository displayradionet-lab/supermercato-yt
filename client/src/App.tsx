import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AppLayout from './pages/AppLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import SearchResults from './pages/SearchResults';
import Deals from './pages/Deals';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Addresses from './pages/Addresses';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts';
import AdminProductForm from './pages/Admin/AdminProductForm';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminDeliveryPartners from './pages/Admin/AdminDeliveryPartners';
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryLayout from './pages/delivery/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1b3022',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />

      <ScrollToTop />

      <Routes>
        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        {/* Main pages - navbar - footer */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="deals" element={<Deals />} />
          <Route element={<ProtectedRoute />}>
            <Route path="deals" element={<Deals />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderTracking />} />
            <Route path="order/:id" element={<OrderTracking />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>

        {/* Admin pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="delivery-partners" element={<AdminDeliveryPartners />} />
        </Route>

        {/* Delivery partners pages */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route path="/delivery" element={<DeliveryLayout />}>
        <Route index element={<DeliveryDashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
