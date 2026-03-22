import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-charcoal/5 bg-ivory/50 backdrop-blur-md py-12 mt-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-serif text-xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-soft-gold to-purple-500">VibeEvents</span>
          <p className="text-sm text-charcoal/60">Sadece bir davetiye değil, dijital bir hikaye.</p>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-charcoal/60">
          <Link to="/" className="hover:text-soft-gold transition-colors">Hakkımızda</Link>
          <Link to="/" className="hover:text-soft-gold transition-colors">Gizlilik</Link>
          <Link to="/" className="hover:text-soft-gold transition-colors">Şartlar</Link>
        </div>
      </div>
    </footer>
  );
}
