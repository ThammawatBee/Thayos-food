import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./page/LoginPage";
import YearCalendar from "./component/YearCalendar";
import CustomerManagement from "./page/CustomerManagementPage";
import UserManagement from "./page/UserManagementPage";
import HomePage from "./page/HomePage";

function App() {
  return (
    <Box>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer-management" element={<CustomerManagement />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/calendar" element={<YearCalendar />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/*" element={<HomePage />} />
      </Routes>
    </Box>
  );
}

export default App;