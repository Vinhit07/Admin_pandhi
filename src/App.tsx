import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { OrderManagement } from './pages/OrderManagement'
import { StaffManagement } from './pages/StaffManagement'
import { StaffDetail } from './pages/StaffDetail'
import { InventoryManagement } from './pages/InventoryManagement'
import { ExpenditureManagement } from './pages/ExpenditureManagement'
import { WalletManagement } from './pages/WalletManagement'
import { CustomerManagement } from './pages/CustomerManagement'
import { TicketManagement } from './pages/TicketManagement'
import { NotificationsManagement } from './pages/NotificationsManagement'
import { ProductManagement } from './pages/ProductManagement'
import { AppManagement } from './pages/AppManagement'
import { ReportsAnalytics } from './pages/ReportsAnalytics'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="order-management" element={<OrderManagement />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="staff-management/:staffId" element={<StaffDetail />} />
          <Route path="inventory-management" element={<InventoryManagement />} />
          <Route path="expenditure-management" element={<ExpenditureManagement />} />
          <Route path="wallet-management" element={<WalletManagement />} />
          <Route path="customer-management" element={<CustomerManagement />} />
          <Route path="ticket-management" element={<TicketManagement />} />
          <Route path="notifications-management" element={<NotificationsManagement />} />
          <Route path="product-management" element={<ProductManagement />} />
          <Route path="app-management" element={<AppManagement />} />
          <Route path="reports-analytics" element={<ReportsAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
