"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Ticket = {
  konser_adi: string;
  tarih: string;
  saat: string;
  fiyat: number;
  mekan: string;
  adres: string;
  image: string;
  concert_id: number;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingTickets, setCancellingTickets] = useState<Set<number>>(new Set());
  const router = useRouter();

  const cancelTicket = async (concertId: number, ticketIndex: number) => {
    setCancellingTickets(prev => new Set(prev).add(ticketIndex));
    
    try {
      const response = await fetch("http://localhost:8000/cancel-ticket/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          concert_id: concertId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Bilet iptal edilemedi");
      }

      const data = await response.json();
      
      // Başarılı iptal durumunda bileti listeden kaldır
      setTickets(prev => prev.filter((_, index) => index !== ticketIndex));
      
      toast.success(`Bilet başarıyla iptal edildi. ${data.iade_edilen_tutar}₺ iade edildi.`);
      
    } catch (error: any) {
      toast.error(error.message || "Bilet iptal edilirken bir hata oluştu");
    } finally {
      setCancellingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketIndex);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("http://localhost:8000/profile/", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Biletler alınamadı");
        }

        const data = await response.json();
        const ticketsWithFullImageUrl = (data.biletler || []).map((ticket: Ticket) => ({
          ...ticket,
          image: `https://cdn.bubilet.com.tr${ticket.image}`
        }));
        setTickets(ticketsWithFullImageUrl);
      } catch (error) {
        toast.error("Biletler yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xl">Biletler Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground"
            onClick={() => router.push("/home")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Button>

          <Card className="anim-fade-in-up">
            <CardHeader>
              <CardTitle className="text-2xl">Biletlerim</CardTitle>
              <CardDescription>
                Satın aldığınız tüm biletleri burada görüntüleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Henüz biletiniz bulunmuyor.</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bir etkinliğe katıldığınızda biletiniz burada görünecektir.
                  </p>
                  <Button className="mt-6" onClick={() => router.push('/home')}>
                    Etkinlikleri Keşfet
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {tickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 flex flex-col md:flex-row gap-4 transition-colors anim-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={ticket.image}
                        alt={ticket.konser_adi}
                        className="w-full md:w-32 h-48 md:h-auto object-cover rounded-md"
                      />
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <h3 className="text-lg font-semibold">{ticket.konser_adi}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.mekan}</p>
                          <div className="mt-3 text-xs space-y-1 text-muted-foreground">
                            <p><strong>Tarih:</strong> {ticket.tarih}</p>
                            <p><strong>Saat:</strong> {ticket.saat}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end justify-between">
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{ticket.fiyat}₺</p>
                            <p className="text-xs text-primary font-medium">Aktif Bilet</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => cancelTicket(ticket.concert_id, index)}
                            disabled={cancellingTickets.has(index)}
                            className="w-full md:w-auto mt-2 md:mt-0"
                          >
                            {cancellingTickets.has(index) ? "İptal Ediliyor..." : "İptal Et"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
