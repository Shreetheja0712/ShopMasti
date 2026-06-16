import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./styles/theme.css";
import "./App.css";

import Home from "./pages/Home/Home";
import ProductsPage from "./pages/Products/ProductsPage";
import ProductView from "./pages/Products/ProductView";
import Cart from "./pages/Cart/Cart";
import EventsPage from "./pages/Events/EventsPage";
import EventViewer from "./pages/Events/EventViewer";
import OrdersPage from "./pages/Orders/OrdersPage";
import OrderConfirmation from "./pages/Orders/OrderConfirmation";
import ProfilePage from "./pages/Profile/ProfilePage";
import AdminLayout from "./pages/Admin/AdminLayout";
import Developers from "./pages/Developers/Developers";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductView />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventViewer />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/developers" element={<Developers />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
