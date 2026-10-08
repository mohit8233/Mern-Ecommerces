import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrders from "./admin/AdminOrders.jsx";
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        <Route
          path="/addresses"
          element={<Addresses />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />
        <Route
          path="/payment/:orderId"
          element={<Payment />}
        />
        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />
        <Route path="/orders" element={<Orders />} />
        <Route
    path="/orders/:orderId"
    element={<OrderDetails />}
/>
<Route
    path="/dashboard"
    element={<UserDashboard />}
/>
<Route
    path="/admin/dashboard"
    element={<AdminDashboard />}
/>
<Route
    path="/admin/orders"
    element={<AdminOrders />}
/>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;