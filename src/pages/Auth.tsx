import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { loginWithGoogle, loginWithEmail, registerWithEmail } from "@/firebase";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, Mail, Lock, User } from "lucide-react";

export function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    if (!isLogin && !name) {
      toast.error("Lütfen adınızı girin.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        toast.success("Başarıyla giriş yapıldı!");
      } else {
        await registerWithEmail(email, password, name);
        toast.success("Hesabınız başarıyla oluşturuldu!");
      }
      navigate("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Bu e-posta adresi zaten kullanımda.");
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error("E-posta veya şifre hatalı.");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Şifreniz çok zayıf. En az 6 karakter kullanın.");
      } else {
        toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      toast.success("Başarıyla giriş yapıldı!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.message !== "cancelled") {
        toast.error("Google ile giriş yapılırken bir hata oluştu.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-soft-gold/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-charcoal/60 hover:text-soft-gold transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        <div className="bg-charcoal/5 backdrop-blur-xl border border-charcoal/10 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-soft-gold/10 text-soft-gold mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-charcoal mb-2">
              {isLogin ? "Tekrar Hoş Geldiniz" : "Aramıza Katılın"}
            </h1>
            <p className="text-charcoal/60">
              {isLogin ? "Hikayenize kaldığınız yerden devam edin." : "Kendi dijital hikayenizi yaratmaya başlayın."}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal/80">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                  <Input 
                    type="text" 
                    placeholder="Adınız Soyadınız" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-ivory/50 border-charcoal/10 focus-visible:ring-soft-gold h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                <Input 
                  type="email" 
                  placeholder="ornek@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-ivory/50 border-charcoal/10 focus-visible:ring-soft-gold h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal/80">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-ivory/50 border-charcoal/10 focus-visible:ring-soft-gold h-12 rounded-xl"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-xl bg-soft-gold text-ivory hover:bg-soft-gold/90 shadow-[0_0_15px_-3px_var(--color-soft-gold)] mt-6"
            >
              {loading ? "İşleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F2F4F7] text-charcoal/40">veya</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleAuth}
            className="w-full h-12 rounded-xl border-charcoal/20 hover:bg-charcoal/5 text-charcoal font-medium"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google ile devam et
          </Button>

          <div className="mt-8 text-center text-sm text-charcoal/60">
            {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-soft-gold hover:underline"
            >
              {isLogin ? "Kayıt Ol" : "Giriş Yap"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
