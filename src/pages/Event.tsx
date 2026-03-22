import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { format, parseISO } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, MapPin, UploadCloud, Share2, CheckCircle2, Download, Image as ImageIcon } from "lucide-react";
import { db, storage } from "@/firebase";
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "@/utils/errorHandling";

export function Event() {
  const { slug } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [rsvpStatus, setRsvpStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [guestName, setGuestName] = useState("");
  const [guestAnswer, setGuestAnswer] = useState("");
  
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (!slug) return;

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEventData(data);
          
          document.title = `${data.title} | VibeEvents`;
          
          const setMetaTag = (property: string, content: string) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
              element = document.createElement('meta');
              element.setAttribute('property', property);
              document.head.appendChild(element);
            }
            element.setAttribute('content', content);
          };

          setMetaTag('og:title', data.title);
          if (data.story) setMetaTag('og:description', data.story.substring(0, 150) + '...');
          if (data.coverImage) setMetaTag('og:image', data.coverImage);
          setMetaTag('og:url', window.location.href);
          setMetaTag('og:type', 'website');
        } else {
          toast.error("Etkinlik bulunamadı.");
        }
      } catch (error) {
        toast.error("Etkinlik yüklenirken hata oluştu.");
        handleFirestoreError(error, OperationType.GET, `events/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // Listen for photos
    const q = query(collection(db, "photos"), where("eventId", "==", slug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPhotos(photosData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "photos");
    });

    return () => {
      document.title = "VibeEvents";
      unsubscribe();
    };
  }, [slug]);

  const handleRSVP = async (e: React.FormEvent, status: "attending" | "declined") => {
    e.preventDefault();
    if (!guestName.trim() || !slug) return;
    
    setRsvpStatus("submitting");
    try {
      await addDoc(collection(db, "rsvps"), {
        eventId: slug,
        guestName,
        guestAnswer: guestAnswer.trim(),
        status,
        createdAt: serverTimestamp()
      });
      setRsvpStatus("success");
      toast.success(status === "attending" ? "Katılımınız onaylandı!" : "Durumunuz bildirildi.");
    } catch (error) {
      setRsvpStatus("idle");
      toast.error("İşlem başarısız oldu.");
      handleFirestoreError(error, OperationType.CREATE, "rsvps");
    }
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Canvas context failed"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          const base64String = canvas.toDataURL('image/jpeg', quality);
          resolve(base64String);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !slug) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64Image = await compressImage(file);
        
        await addDoc(collection(db, "photos"), {
          eventId: slug,
          uploaderName: guestName || "Misafir",
          imageUrl: base64Image,
          createdAt: serverTimestamp()
        });
      }
      toast.success("Fotoğraflar başarıyla yüklendi!");
    } catch (error) {
      toast.error("Fotoğraf yüklenirken hata oluştu.");
      handleFirestoreError(error, OperationType.CREATE, "photos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddToCalendar = () => {
    if (!eventData) return;
    
    const startDate = eventData.date.replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(new Date(eventData.date).getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventData.story)}&location=${encodeURIComponent(eventData.location)}`;
    window.open(url, '_blank');
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${eventData.title}-QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">Hikaye Yükleniyor...</div>;
  if (!eventData) return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">Etkinlik bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-ivory">
      
      {/* Hero Cover */}
      <section className="relative h-[100svh] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
          <img 
            src={eventData.coverImage || "https://picsum.photos/seed/event/1920/1080"} 
            alt="Kapak" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-charcoal/40" />
        </motion.div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className="text-ivory/80 uppercase tracking-[0.3em] text-sm font-medium">Davetlisiniz</p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-medium tracking-tight text-ivory leading-[0.9]">
              {eventData.title}
            </h1>
            <div className="w-px h-24 bg-ivory/30 mx-auto mt-12" />
          </motion.div>
        </div>
      </section>

      {/* Story Content */}
      <section className="relative z-20 bg-ivory py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg md:prose-xl prose-stone mx-auto"
          >
            <p className="font-serif text-2xl md:text-3xl leading-relaxed text-charcoal/90 text-center mb-16 whitespace-pre-wrap">
              {eventData.story}
            </p>
          </motion.div>

          {/* Details Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16 border-y border-charcoal/10 my-16"
          >
            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto md:mx-0 text-soft-gold">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium">Ne Zaman</h3>
              <p className="text-charcoal/60 font-light">
                {format(parseISO(eventData.date), "dd MMMM yyyy, EEEE")}
                <br />
                {format(parseISO(eventData.date), "HH:mm")}
              </p>
              <Button variant="link" onClick={handleAddToCalendar} className="px-0 text-soft-gold hover:text-soft-gold/80">
                Takvime Ekle
              </Button>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto md:mx-0 text-soft-gold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-medium">Nerede</h3>
              <p className="text-charcoal/60 font-light">
                {eventData.location}
              </p>
              <Button variant="link" className="px-0 text-soft-gold hover:text-soft-gold/80" onClick={() => window.open(`https://maps.google.com/?q=${eventData.location}`, '_blank')}>
                Haritalarda Aç
              </Button>
            </div>
          </motion.div>

          {/* RSVP Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-charcoal text-ivory rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-[0_0_40px_-10px_var(--color-soft-gold)]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-soft-gold/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 max-w-md mx-auto space-y-8">
              <h2 className="font-serif text-3xl font-medium">
                {eventData.customQuestion || "Bize iletmek istediğiniz bir not var mı?"}
              </h2>
              
              {rsvpStatus === "success" ? (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4 py-8"
                >
                  <CheckCircle2 className="w-16 h-16 text-soft-gold mx-auto" />
                  <p className="text-xl font-light">Teşekkürler, {guestName}!</p>
                </motion.div>
              ) : (
                <form className="space-y-4">
                  <Input 
                    placeholder="Adınız Soyadınız" 
                    required 
                    maxLength={100}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="bg-ivory/10 border-ivory/20 text-ivory placeholder:text-ivory/40 focus-visible:border-soft-gold h-14 rounded-xl px-6"
                  />
                  <Textarea 
                    placeholder="Yanıtınız... (İsteğe Bağlı)" 
                    maxLength={1000}
                    value={guestAnswer}
                    onChange={(e) => setGuestAnswer(e.target.value)}
                    className="bg-ivory/10 border-ivory/20 text-ivory placeholder:text-ivory/40 focus-visible:border-soft-gold min-h-[100px] rounded-xl px-6 py-4 resize-none"
                  />
                  <div className="flex flex-col gap-3 pt-2">
                    <Button 
                      type="button"
                      onClick={(e) => handleRSVP(e, "attending")}
                      disabled={rsvpStatus === "submitting" || !guestName.trim()}
                      className="w-full h-14 rounded-xl bg-soft-gold text-ivory hover:bg-soft-gold/90 text-lg font-medium shadow-[0_0_15px_-3px_var(--color-soft-gold)]"
                    >
                      {rsvpStatus === "submitting" ? "İşleniyor..." : "Evet, Katılacağım"}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={(e) => handleRSVP(e, "declined")}
                      disabled={rsvpStatus === "submitting" || !guestName.trim()}
                      variant="ghost" 
                      className="w-full text-ivory/60 hover:text-ivory hover:bg-ivory/10"
                    >
                      Maalesef Katılamayacağım
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* Media Bridge & QR */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="border border-charcoal/10 rounded-3xl p-8 text-center space-y-6 bg-ivory transition-colors">
              <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto text-charcoal">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-medium mb-2">Medya Köprüsü</h3>
                <p className="text-charcoal/60 font-light text-sm mb-4">Etkinlikte çektiğiniz fotoğrafları bizimle paylaşın.</p>
                
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  className="rounded-full w-full mb-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
                </Button>
                
                {eventData.driveLink && (
                  <Button 
                    variant="link" 
                    className="text-xs text-charcoal/60"
                    onClick={() => window.open(eventData.driveLink, '_blank')}
                  >
                    Google Drive Klasörünü Aç
                  </Button>
                )}
              </div>
            </div>

            <div className="border border-charcoal/10 rounded-3xl p-8 text-center space-y-6 bg-ivory flex flex-col items-center justify-center">
              <h3 className="font-serif text-2xl font-medium">Paylaşım</h3>
              <div className="p-4 bg-ivory rounded-2xl shadow-sm border border-charcoal/5">
                {/* Using canvas to allow downloading */}
                <QRCodeCanvas id="qr-code" value={window.location.href} size={120} fgColor="#1A1A1A" />
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant="outline" className="rounded-full gap-2 text-xs" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Bağlantı kopyalandı!");
                }}>
                  <Share2 className="w-3 h-3" /> Kopyala
                </Button>
                <Button variant="outline" className="rounded-full gap-2 text-xs" onClick={downloadQR}>
                  <Download className="w-3 h-3" /> QR İndir
                </Button>
                <Button variant="outline" className="rounded-full gap-2 text-xs" onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Bu etkinliğe davetlisiniz: ${eventData.title} - ${window.location.href}`)}`, '_blank');
                }}>
                  WhatsApp
                </Button>
                <Button variant="outline" className="rounded-full gap-2 text-xs" onClick={() => {
                  window.open(`mailto:?subject=${encodeURIComponent(eventData.title)}&body=${encodeURIComponent(`Bu etkinliğe davetlisiniz: ${window.location.href}`)}`, '_blank');
                }}>
                  E-posta
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-24"
            >
              <h2 className="text-3xl font-serif font-medium text-center mb-12">Anı Galerisi</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden bg-charcoal/5 relative group">
                    <img src={photo.imageUrl} alt="Event memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-ivory text-xs font-medium">{photo.uploaderName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>
    </div>
  );
}
