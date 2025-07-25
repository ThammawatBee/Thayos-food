import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./page/LoginPage";
import CustomerManagement from "./page/CustomerManagementPage";
import UserManagement from "./page/UserManagementPage";
import HomePage from "./page/HomePage";
import PrivateRoute from "./layout/PrivateRoute";
import CalendarPage from "./page/CalendarPage";
import "react-datepicker/dist/react-datepicker.css";
import OrderPage from "./page/OrderPage";
import PaymentPage from "./page/PaymentPage";

function App() {
  return (
    <Box>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={
          <LoginPage />
        } />
        <Route path="/customer-management" element={
          <PrivateRoute>
            <CustomerManagement />
          </PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/calendar" element={
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>} />
        <Route path="/order" element={
          <PrivateRoute>
            <OrderPage />
          </PrivateRoute>} />
        <Route path="/payment" element={
          <PrivateRoute>
            <PaymentPage />
          </PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/*" element={<LoginPage />} />
      </Routes>
    </Box>
  );
}

export default App;