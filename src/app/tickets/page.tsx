"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";

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
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white pt-32 pb-10">
      <Toaster richColors position="top-center" />
      <div className="max-w-4xl mx-auto px-4">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          onClick={() => router.push("/home")}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Geri
        </Button>

        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Biletlerim</h2>
          
          {tickets.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">
              Henüz biletiniz bulunmuyor.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="bg-zinc-700/50 rounded-lg p-6 space-y-4 hover:bg-zinc-700/70 transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Konser Fotoğrafı */}
                    <div className="w-48 h-48 flex-shrink-0">
                      <img
                        src={ticket.image}
                        alt={ticket.konser_adi}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Bilet Bilgileri */}
                    <div className="flex-grow flex justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{ticket.konser_adi}</h3>
                        <div className="space-y-2 text-zinc-300">
                          <div className="flex items-center">
                            <span className="mr-2">📍</span>
                            <span>{ticket.mekan}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>{ticket.tarih}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">⏰</span>
                            <span>{ticket.saat}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">🏠</span>
                            <span className="text-sm">{ticket.adres}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400 mb-2">
                          {ticket.fiyat}₺
                        </div>
                        <div className="text-sm text-zinc-400 mb-3">
                          Bilet Durumu: <span className="text-green-400">Aktif</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelTicket(ticket.concert_id, index)}
                          disabled={cancellingTickets.has(index)}
                          className="w-full"
                        >
                          {cancellingTickets.has(index) ? "İptal Ediliyor..." : "Bileti İptal Et"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
