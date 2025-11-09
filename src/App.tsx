import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProviderMySQL as AuthProvider } from "@/contexts/AuthContextMySQL";
import { ProductsProviderMySQL as ProductsProvider } from "@/contexts/ProductsContextMySQL";
import { EmailMarketingProvider } from "@/contexts/EmailMarketing";
import { OrdersProvider } from "@/contexts/OrdersContext";
import { UsersProvider } from "@/contexts/UsersContext";
import { ReturnsProvider } from "@/contexts/ReturnsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ChatBotProvider } from "@/contexts/ChatBotContext";
import Index from "./pages/Index";
import Marketing from "./pages/Marketing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ReturnsPage from "./pages/Returns";
import Products from "./pages/Products";
import Promotions from "./pages/Promotions";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import PaymentReceipt from "./pages/PaymentReceipt";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import OrderTracking from "./pages/OrderTracking";
import Unsubscribe from "./pages/Unsubscribe";
import ReturnPolicy from "./pages/ReturnPolicy";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import DebugAuth from "./pages/DebugAuth";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering...");
  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UsersProvider>
          <ProductsProvider>
            <OrdersProvider>
              <ReturnsProvider>
                <NotificationsProvider>
                  <ChatBotProvider>
                  <EmailMarketingProvider>
                    <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/tracking/:orderId?" element={<OrderTracking />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
            <Route path="/payment-receipt/:transactionId" element={<ProtectedRoute><PaymentReceipt /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
            <Route path="/marketing" element={<ProtectedRoute requireAdmin><Marketing /></ProtectedRoute>} />
            <Route path="/debug-auth" element={<DebugAuth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
                    </CartProvider>
                  </EmailMarketingProvider>
                  </ChatBotProvider>
                </NotificationsProvider>
              </ReturnsProvider>
            </OrdersProvider>
          </ProductsProvider>
        </UsersProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
