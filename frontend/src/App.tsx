import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./app/layouts/AppLayout";
import { LandingPage } from "./app/pages/Landing";
import { LoginPage } from "./app/pages/Login";
import { RegisterPage } from "./app/pages/Register";
import { DashboardPage } from "./app/pages/Dashboard";
import { TransactionsPage } from "./app/pages/Transactions";
import { CategoriesPage } from "./app/pages/Categories";
import { ProfilePage } from "./app/pages/Profile";
import { LicensePage, PrivacyPage, TermsPage } from "./app/pages/Legal";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/termos" element={<TermsPage />} />
      <Route path="/privacidade" element={<PrivacyPage />} />
      <Route path="/licenca" element={<LicensePage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/new" element={<Navigate to="/transactions" replace />} />
        <Route path="/transactions/:id/edit" element={<Navigate to="/transactions" replace />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
