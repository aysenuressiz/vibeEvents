import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Calendar, MapPin, ExternalLink, QrCode, ImagePlus, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "@/utils/errorHandling";

export function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "events"), where("hostId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
      } catch (error) {
        toast.error("Etkinlikler yüklenirken bir hata oluştu.");
        handleFirestoreError(error, OperationType.LIST, "events");
      } finally {
        setFetching(false);
      }
    };

    fetchEvents();
  }, [user]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteDoc(doc(db, "events", eventToDelete));
      setEvents(events.filter(e => e.id !== eventToDelete));
      toast.success("Etkinlik silindi.");
    } catch (error) {
      toast.error("Silme işlemi başarısız oldu.");
      handleFirestoreError(error, OperationType.DELETE, `events/${eventToDelete}`);
    } finally {
      setEventToDelete(null);
    }
  };

  if (loading || fetching) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-ivory px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-medium text-charcoal">Panelim</h1>
            <p className="text-charcoal/60 mt-2">Etkinliklerinizi buradan yönetebilirsiniz.</p>
          </div>
          <Link to="/editor">
            <Button className="rounded-full gap-2 bg-soft-gold text-ivory hover:bg-soft-gold/90 shadow-[0_0_15px_-3px_var(--color-soft-gold)]">
              <Plus className="w-4 h-4" />
              Yeni Etkinlik Oluştur
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-24 bg-charcoal/5 rounded-3xl border border-charcoal/10">
            <div className="w-16 h-16 bg-ivory rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal/40">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-medium mb-2">Henüz bir etkinlik yok</h3>
            <p className="text-charcoal/60 mb-6">İlk hikayenizi oluşturmaya hemen başlayın.</p>
            <Link to="/editor">
              <Button variant="outline" className="rounded-full border-soft-gold/30 text-soft-gold hover:bg-soft-gold/10 hover:text-soft-gold">Oluştur</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-charcoal/5 rounded-3xl overflow-hidden border border-charcoal/10 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video relative overflow-hidden bg-charcoal/5">
                  {event.coverImage ? (
                    <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal/20">
                      <ImagePlus className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Link to={`/editor/${event.slug}`}>
                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-ivory/90 backdrop-blur-sm border-none shadow-sm hover:bg-ivory text-charcoal">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button onClick={() => setEventToDelete(event.id)} size="icon" variant="outline" className="h-8 w-8 rounded-full bg-ivory/90 backdrop-blur-sm border-none shadow-sm hover:bg-red-500/20 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-serif text-xl font-medium mb-4 line-clamp-1">{event.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-charcoal/60">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(event.date), "dd MMM yyyy, HH:mm")}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-charcoal/60">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-charcoal/10">
                    <Link to={`/event/${event.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full gap-2 text-xs">
                        <ExternalLink className="w-3 h-3" />
                        Görüntüle
                      </Button>
                    </Link>
                    <Link to={`/dashboard/${event.slug}/rsvps`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full gap-2 text-xs">
                        <MessageSquare className="w-3 h-3" />
                        Yanıtlar
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon" className="rounded-full shrink-0" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/event/${event.slug}`);
                      toast.success("Bağlantı kopyalandı!");
                    }}>
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-ivory rounded-3xl p-8 max-w-md w-full shadow-xl border border-charcoal/10"
          >
            <h3 className="text-2xl font-serif font-medium mb-4">Etkinliği Sil</h3>
            <p className="text-charcoal/60 mb-8">Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setEventToDelete(null)} className="rounded-full">İptal</Button>
              <Button onClick={handleDelete} className="rounded-full bg-red-600 hover:bg-red-700 text-white">Sil</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
