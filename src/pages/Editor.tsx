import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Calendar, MapPin, Link as LinkIcon, Save, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "@/utils/errorHandling";

export function Editor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug: editSlug } = useParams();
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(!!editSlug);
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    coverImage: "",
    date: "",
    location: "",
    driveLink: "",
    customQuestion: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    if (editSlug) {
      const fetchEvent = async () => {
        try {
          const docRef = doc(db, "events", editSlug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().hostId === user.uid) {
            const data = docSnap.data();
            setFormData({
              title: data.title || "",
              story: data.story || "",
              coverImage: data.coverImage || "",
              date: data.date || "",
              location: data.location || "",
              driveLink: data.driveLink || "",
              customQuestion: data.customQuestion || ""
            });
          } else {
            toast.error("Etkinlik bulunamadı veya yetkiniz yok.");
            navigate("/dashboard");
          }
        } catch (error) {
          toast.error("Etkinlik yüklenirken hata oluştu.");
          handleFirestoreError(error, OperationType.GET, `events/${editSlug}`);
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [editSlug, user, navigate]);

  const generateSlug = (text: string) => {
    const trMap: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'c',
      'ğ': 'g', 'Ğ': 'g',
      'ı': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o',
      'ş': 's', 'Ş': 's',
      'ü': 'u', 'Ü': 'u'
    };
    return text
      .replace(/[çÇğĞıİöÖşŞüÜ]/g, match => trMap[match])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'etkinlik';
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsPublishing(true);
    
    try {
      const baseSlug = generateSlug(formData.title);
      const slug = editSlug || `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      
      const eventData = {
        ...formData,
        hostId: user.uid,
        slug,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "events", slug), eventData, { merge: true });
      
      toast.success("Hikayeniz başarıyla yayınlandı!");
      navigate(`/event/${slug}`);
    } catch (error) {
      toast.error("Yayınlanırken bir hata oluştu.");
      handleFirestoreError(error, OperationType.WRITE, "events");
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen pt-20 bg-ivory">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-charcoal mb-4">
            Hikayenizi Yaratın
          </h1>
          <p className="text-charcoal/60 font-light text-lg">
            Etkinlik sayfanızı bir dergi kapağı gibi tasarlayın.
          </p>
        </motion.div>

        <form onSubmit={handlePublish} className="space-y-12">
          
          {/* Cover Image Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-charcoal/5 border border-charcoal/10 flex flex-col items-center justify-center transition-all hover:bg-charcoal/10 cursor-pointer"
          >
            {formData.coverImage ? (
              <img 
                src={formData.coverImage} 
                alt="Kapak" 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-full bg-ivory shadow-sm flex items-center justify-center mx-auto text-charcoal/40 group-hover:text-charcoal transition-colors">
                  <ImagePlus className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-charcoal/60">Kapak Fotoğrafı Yükle</p>
                <p className="text-xs text-charcoal/40">Yüksek çözünürlük önerilir (1920x1080)</p>
              </div>
            )}
            <input 
              type="text" 
              placeholder="Veya görsel URL'si yapıştırın..."
              maxLength={2000}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-ivory/90 backdrop-blur-sm border-none rounded-full px-6 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
              value={formData.coverImage}
              onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>

          {/* Editorial Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <input
                type="text"
                placeholder="Manşet Başlığı..."
                required
                maxLength={200}
                className="w-full bg-transparent border-none text-5xl md:text-7xl font-serif font-medium tracking-tight text-charcoal placeholder:text-charcoal/20 focus:outline-none focus:ring-0 px-0"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="relative">
              <Textarea
                placeholder="Hikayenizi buraya yazın... Nasıl tanıştınız? Etkinliğin amacı ne? Kişiselleştirin."
                required
                maxLength={10000}
                className="min-h-[300px] text-lg md:text-xl font-light leading-relaxed text-charcoal/80 bg-transparent border-none focus-visible:ring-0 px-0 resize-none placeholder:text-charcoal/30"
                value={formData.story}
                onChange={(e) => setFormData({...formData, story: e.target.value})}
              />
            </div>
          </motion.div>

          {/* Event Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-charcoal/10"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Tarih & Saat
              </label>
              <Input 
                type="datetime-local" 
                required
                className="border-none bg-charcoal/5 rounded-xl px-4"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Konum
              </label>
              <Input 
                type="text" 
                placeholder="Mekan adı veya adresi"
                required
                maxLength={500}
                className="border-none bg-charcoal/5 rounded-xl px-4"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Medya Köprüsü
              </label>
              <Input 
                type="url" 
                placeholder="Google Drive Klasör Linki"
                maxLength={2000}
                className="border-none bg-charcoal/5 rounded-xl px-4"
                value={formData.driveLink}
                onChange={(e) => setFormData({...formData, driveLink: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-charcoal/40 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Davetlilere Sorunuz
              </label>
              <Input 
                type="text" 
                placeholder="Örn: Hangi yemeği tercih edersiniz?"
                maxLength={200}
                className="border-none bg-charcoal/5 rounded-xl px-4"
                value={formData.customQuestion}
                onChange={(e) => setFormData({...formData, customQuestion: e.target.value})}
              />
            </div>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-ivory/90 backdrop-blur-md border-t border-charcoal/10 flex justify-end z-40"
          >
            <div className="max-w-7xl mx-auto w-full flex justify-end gap-4">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => navigate("/dashboard")}>İptal</Button>
              <Button 
                type="submit" 
                disabled={isPublishing}
                className="rounded-full bg-soft-gold text-ivory hover:bg-soft-gold/90 px-8 shadow-[0_0_15px_-3px_var(--color-soft-gold)]"
              >
                {isPublishing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                    Yayınlanıyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Hikayeyi Yayınla
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

        </form>
      </div>
    </div>
  );
}
