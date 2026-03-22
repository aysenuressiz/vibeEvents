import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { handleFirestoreError, OperationType } from "@/utils/errorHandling";

export function EventRSVPs() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [eventData, setEventData] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !slug) return;
      
      try {
        // Fetch event to ensure ownership
        const docRef = doc(db, "events", slug);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.hostId !== user.uid) {
            navigate("/dashboard");
            return;
          }
          setEventData(data);
          
          // Fetch RSVPs
          const q = query(collection(db, "rsvps"), where("eventId", "==", slug));
          const querySnapshot = await getDocs(q);
          const rsvpsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          // Sort by creation date
          rsvpsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          setRsvps(rsvpsData);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `events/${slug}`);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, slug, navigate]);

  if (loading || fetching) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">Yükleniyor...</div>;
  }

  const attendingCount = rsvps.filter(r => r.status === "attending").length;
  const declinedCount = rsvps.filter(r => r.status === "declined").length;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-ivory px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-charcoal/70">
              <ArrowLeft className="w-4 h-4" />
              Panele Dön
            </Button>
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-serif font-medium text-charcoal mb-2">Davetli Yanıtları</h1>
          <p className="text-charcoal/60 text-lg">{eventData?.title} etkinliği için yanıtlar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-charcoal/5 p-6 rounded-3xl border border-charcoal/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Toplam</p>
              <p className="text-2xl font-serif font-medium">{rsvps.length}</p>
            </div>
          </div>
          <div className="bg-charcoal/5 p-6 rounded-3xl border border-charcoal/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Katılacaklar</p>
              <p className="text-2xl font-serif font-medium">{attendingCount}</p>
            </div>
          </div>
          <div className="bg-charcoal/5 p-6 rounded-3xl border border-charcoal/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Katılmayacaklar</p>
              <p className="text-2xl font-serif font-medium">{declinedCount}</p>
            </div>
          </div>
          <div className="bg-charcoal/5 p-6 rounded-3xl border border-charcoal/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-soft-gold/10 flex items-center justify-center text-soft-gold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">Sorulan Soru</p>
              <p className="text-xs font-serif font-medium line-clamp-2" title={eventData?.customQuestion || "Bize iletmek istediğiniz bir not var mı?"}>
                {eventData?.customQuestion || "Bize iletmek istediğiniz bir not var mı?"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-charcoal/5 rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">
          {rsvps.length === 0 ? (
            <div className="p-12 text-center text-charcoal/60">
              Henüz yanıt veren kimse yok.
            </div>
          ) : (
            <div className="divide-y divide-charcoal/5">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="p-6 flex flex-col gap-4 hover:bg-charcoal/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{rsvp.guestName}</p>
                      <p className="text-sm text-charcoal/50">
                        {rsvp.createdAt ? format(rsvp.createdAt.toDate(), "dd MMM yyyy, HH:mm") : "Bilinmeyen tarih"}
                      </p>
                    </div>
                    <div>
                      {rsvp.status === "attending" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Katılıyor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Katılmıyor
                        </span>
                      )}
                    </div>
                  </div>
                  {rsvp.guestAnswer && (
                    <div className="bg-ivory p-4 rounded-2xl border border-charcoal/5 text-charcoal/80 whitespace-pre-wrap text-sm md:text-base">
                      {rsvp.guestAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
