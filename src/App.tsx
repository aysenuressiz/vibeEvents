/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Landing } from "@/pages/Landing";
import { Editor } from "@/pages/Editor";
import { Event } from "@/pages/Event";
import { Dashboard } from "@/pages/Dashboard";
import { EventRSVPs } from "@/pages/EventRSVPs";
import { Auth } from "@/pages/Auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Layout() {
  const location = useLocation();
  const isEventPage = location.pathname.startsWith('/event/');
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal font-sans selection:bg-soft-gold/30 relative overflow-hidden">
      {/* Global Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-soft-gold/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {!isEventPage && !isAuthPage && <Navbar />}
        <main className="flex-1">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:slug/rsvps" element={<EventRSVPs />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/editor/:slug" element={<Editor />} />
              <Route path="/event/:slug" element={<Event />} />
            </Routes>
          </ErrorBoundary>
        </main>
        {!isEventPage && !isAuthPage && <Footer />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
        <Toaster position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}
