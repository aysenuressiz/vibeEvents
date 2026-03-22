import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Image as ImageIcon, QrCode } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-48 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl space-y-8"
        >
          <div className="inline-flex items-center rounded-full border border-soft-gold/30 bg-soft-gold/10 px-4 py-1.5 text-sm font-medium text-soft-gold mb-4">
            <span className="flex h-2 w-2 rounded-full bg-soft-gold mr-2 animate-pulse"></span>
            VibeEvents ile Tanışın
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[1.1] text-charcoal">
            Sadece bir davetiye değil,<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-soft-gold to-purple-500">dijital bir hikaye.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto font-light leading-relaxed">
            Dergi kalitesinde etkinlik sayfaları oluşturun. Hikayenizi paylaşın, davetli yanıtlarını sorunsuzca toplayın ve misafirlerinizin anı galerisine katkıda bulunmasına izin verin.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button onClick={handleStart} size="lg" className="h-14 px-8 text-base bg-soft-gold text-ivory hover:bg-soft-gold/90 rounded-full w-full sm:w-auto shadow-[0_0_30px_-5px_var(--color-soft-gold)]">
              {user ? "Panelime Git" : "Hemen Başla"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-charcoal text-ivory py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-soft-gold/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-ivory/10 flex items-center justify-center text-soft-gold">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl">Editoryal Tasarım</h3>
              <p className="text-ivory/60 font-light leading-relaxed">
                Devasa kapak fotoğrafları yükleyin, çarpıcı başlıklar atın ve zengin metin editörümüzle hikayenizi anlatın. Etkinliğiniz bir dergi kapağı gibi görünmeyi hak ediyor.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-ivory/10 flex items-center justify-center text-soft-gold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl">Akıllı QR Erişim</h3>
              <p className="text-ivory/60 font-light leading-relaxed">
                Her hikaye için özel, şık tasarımlı bir QR kod oluşturulur. Fiziksel kartlara bastırın veya etkinlik sayfanıza anında erişim için dijital olarak paylaşın.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-ivory/10 flex items-center justify-center text-soft-gold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl">Kolay Yanıt Toplama</h3>
              <p className="text-ivory/60 font-light leading-relaxed">
                Misafirler sorularınızı kolayca yanıtlayabilir ve etkinliği otomatik olarak telefon takvimlerine ekleyebilirler. Gelen yanıtları gerçek zamanlı olarak izleyin.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Media Bridge Teaser */}
      <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">
              Medya Köprüsü.<br />
              <span className="italic text-charcoal/60">Anıları zahmetsizce toplayın.</span>
            </h2>
            <p className="text-lg text-charcoal/70 font-light leading-relaxed">
              Etkinlikten sonra insanlardan fotoğraf istemekle uğraşmayın. Etkinlik sayfanız, misafir fotoğraflarını doğrudan sayfanızda ve Google Drive klasörünüzde toplayan özel bir yükleme portalı içerir.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-charcoal/5"
          >
            <img 
              src="https://picsum.photos/seed/wedding/800/600" 
              alt="Event memories" 
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
