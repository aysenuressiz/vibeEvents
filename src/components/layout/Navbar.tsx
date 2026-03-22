import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/firebase";
import { toast } from "sonner";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Çıkış yapıldı.");
      navigate("/");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu.");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ivory/80 backdrop-blur-md border-b border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-soft-gold transition-transform group-hover:rotate-12" />
          <span className="font-serif text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-soft-gold to-purple-500">VibeEvents</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden sm:inline-flex gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Panelim
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="icon" className="rounded-full border-charcoal/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button onClick={handleLogin} className="bg-soft-gold text-ivory hover:bg-soft-gold/90 shadow-[0_0_15px_-3px_var(--color-soft-gold)]">Giriş Yap / Kayıt Ol</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
