"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShoppingCart, User } from "lucide-react";
import { toast } from "sonner";

const cities = [
  { code: "01", name: "Adana" }, { code: "02", name: "Adıyaman" }, { code: "03", name: "Afyonkarahisar" },
  { code: "04", name: "Ağrı" }, { code: "05", name: "Amasya" }, { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" }, { code: "08", name: "Artvin" }, { code: "09", name: "Aydın" },
  { code: "10", name: "Balıkesir" }, { code: "11", name: "Bilecik" }, { code: "12", name: "Bingöl" },
  { code: "13", name: "Bitlis" }, { code: "14", name: "Bolu" }, { code: "15", name: "Burdur" },
  { code: "16", name: "Bursa" }, { code: "17", name: "Çanakkale" }, { code: "18", name: "Çankırı" },
  { code: "19", name: "Çorum" }, { code: "20", name: "Denizli" }, { code: "21", name: "Diyarbakır" },
  { code: "22", name: "Edirne" }, { code: "23", name: "Elazığ" }, { code: "24", name: "Erzincan" },
  { code: "25", name: "Erzurum" }, { code: "26", name: "Eskişehir" }, { code: "27", name: "Gaziantep" },
  { code: "28", name: "Giresun" }, { code: "29", name: "Gümüşhane" }, { code: "30", name: "Hakkari" },
  { code: "31", name: "Hatay" }, { code: "32", name: "Isparta" }, { code: "33", name: "Mersin" },
  { code: "34", name: "İstanbul" }, { code: "35", name: "İzmir" }, { code: "36", name: "Kars" },
  { code: "37", name: "Kastamonu" }, { code: "38", name: "Kayseri" }, { code: "39", name: "Kırklareli" },
  { code: "40", name: "Kırşehir" }, { code: "41", name: "Kocaeli" }, { code: "42", name: "Konya" },
  { code: "43", name: "Kütahya" }, { code: "44", name: "Malatya" }, { code: "45", name: "Manisa" },
  { code: "46", name: "Kahramanmaraş" }, { code: "47", name: "Mardin" }, { code: "48", name: "Muğla" },
  { code: "49", name: "Muş" }, { code: "50", name: "Nevşehir" }, { code: "51", name: "Niğde" },
  { code: "52", name: "Ordu" }, { code: "53", name: "Rize" }, { code: "54", name: "Sakarya" },
  { code: "55", name: "Samsun" }, { code: "56", name: "Siirt" }, { code: "57", name: "Sinop" },
  { code: "58", name: "Sivas" }, { code: "59", name: "Tekirdağ" }, { code: "60", name: "Tokat" },
  { code: "61", name: "Trabzon" }, { code: "62", name: "Tunceli" }, { code: "63", name: "Şanlıurfa" },
  { code: "64", name: "Uşak" }, { code: "65", name: "Van" }, { code: "66", name: "Yozgat" },
  { code: "67", name: "Zonguldak" }, { code: "68", name: "Aksaray" }, { code: "69", name: "Bayburt" },
  { code: "70", name: "Karaman" }, { code: "71", name: "Kırıkkale" }, { code: "72", name: "Batman" },
  { code: "73", name: "Şırnak" }, { code: "74", name: "Bartın" }, { code: "75", name: "Ardahan" },
  { code: "76", name: "Iğdır" }, { code: "77", name: "Yalova" }, { code: "78", name: "Karabük" },
  { code: "79", name: "Kilis" }, { code: "80", name: "Osmaniye" }, { code: "81", name: "Düzce" },
];

type Concert = {
  concert_id: number;
  konser_adi: string;
  tarih: string;
  saat: string;
  fiyat: number;
  mekan: string;
  adres: string;
  image: string;
};

type CartItem = Concert & {
  quantity: number;
};

const PAGE_SIZE = 24;

export default function HomePage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [filtered, setFiltered] = useState<Concert[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [cityName, setCityName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clickedButtonId, setClickedButtonId] = useState<number | null>(null);

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.code.includes(search)
  );

  const handleSelect = (city: { code: string; name: string }) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCity", JSON.stringify(city));
    }
    router.push("/home");
  };

  useEffect(() => {
    // Seçilen şehir id'sini ve adını localStorage'dan al
    const city = localStorage.getItem("selectedCity");
    if (!city) return;
    const { code, name } = JSON.parse(city);
    setCityName(name);

    // API'den konserleri çek
    fetch(`http://localhost:8000/get-concert/?sehir_id=${code}`)
      .then((res) => res.json())
      .then((data) => {
        setConcerts(data.konserler || []);
        setFiltered(data.konserler || []);
      });
  }, []);

  // Arama filtreleme
  useEffect(() => {
    setPage(1); // Arama değişince ilk sayfaya dön
    setFiltered(
      concerts.filter((c) =>
        c.konser_adi.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, concerts]);

  // Sayfalama için slice
  const pagedConcerts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let last = performance.now();
    const speed = 120; // px/s

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += speed * dt;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [filtered]);

  const addToCart = (concert: Concert) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.concert_id === concert.concert_id);
      if (existingItem) {
        return prevCart.map(item =>
          item.concert_id === concert.concert_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...concert, quantity: 1 }];
    });
    toast.success("Konser sepete eklendi!");
  };

  const removeFromCart = (concertId: number) => {
    setCart(prevCart => prevCart.filter(item => item.concert_id !== concertId));
    toast.success("Konser sepetten çıkarıldı!");
  };

  const updateQuantity = (concertId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.concert_id === concertId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.fiyat * item.quantity), 0);
  };

  const handleCheckout = async () => {
    const isLoggedIn = localStorage.getItem("user") !== null;

    if (!isLoggedIn) {
      localStorage.setItem("pendingTickets", JSON.stringify(cart.map(item => item.concert_id)));
      router.push("/login");
      return;
    }

    try {
      for (const item of cart) {
        const response = await fetch("http://localhost:8000/buy-ticket/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ concert_id: item.concert_id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Bilet satın alınamadı");
        }
      }

      setCart([]);
      setIsCartOpen(false);
      toast.success("Tüm biletler başarıyla satın alındı!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ödeme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center pt-32 pb-10">
      {/* Üst Bar */}
      <div className="fixed top-0 left-0 right-0 bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-700 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              className="bg-zinc-700 border-none text-white placeholder:text-zinc-400 w-64 h-10"
              placeholder="Konser Ara"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {cityName && (
              <Button
                variant="outline"
                className="whitespace-nowrap bg-white text-black border-none hover:bg-gray-200"
                onClick={() => router.push("/")}
              >
                {cityName}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Konser Kartları */}
      <div className="w-full overflow-x-auto hide-scrollbar" ref={scrollRef}>
        <div
          className="flex gap-x-8 py-4 flex-nowrap"
          style={{ minWidth: `${pagedConcerts.length * 370}px`, willChange: "transform" }}
        >
          {pagedConcerts.map((concert) => {
            const imageUrl = `https://cdn.bubilet.com.tr${concert.image}`;
            const isButtonClicked = clickedButtonId === concert.concert_id;
            return (
              <div
                key={concert.concert_id}
                className="bg-zinc-800 rounded-xl shadow-lg flex flex-col items-center p-6 min-w-[350px] max-w-[350px] h-[480px] transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                onClick={() => setSelectedConcert(concert)}
              >
                <img
                  src={imageUrl}
                  alt={concert.konser_adi}
                  className="w-full h-56 object-cover rounded-lg mb-4"
                />
                <div className="font-bold text-xl text-center mb-2 line-clamp-2 h-14 flex items-center justify-center w-full">
                  {concert.konser_adi}
                </div>
                <div className="flex items-center text-sm text-zinc-300 mb-1 w-full h-6">
                  <span className="mr-1">📍</span>
                  <span className="truncate">{concert.mekan}</span>
                </div>
                <div className="flex items-center text-sm text-zinc-400 mb-2 w-full h-6">
                  <span className="mr-1">📅</span>
                  <span>{concert.tarih}</span>
                </div>
                <div className="text-green-400 font-semibold text-lg mb-3">
                  {concert.fiyat}₺
                </div>
                <div className="flex-grow" />
                <Button 
                  className={`w-full mt-auto relative overflow-hidden transition-all duration-300 ${
                    isButtonClicked ? 'bg-green-600 scale-95' : 'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickedButtonId(concert.concert_id);
                    addToCart(concert);
                    setTimeout(() => setClickedButtonId(null), 300);
                  }}
                >
                  <span className={`relative z-10 transition-transform duration-300 ${
                    isButtonClicked ? 'scale-90' : ''
                  }`}>
                    {isButtonClicked ? 'Eklendi!' : 'Sepete Ekle'}
                  </span>
                  {isButtonClicked && (
                    <div className="absolute inset-0 bg-green-400 animate-pulse" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Konser Detay Modalı */}
      <Dialog open={!!selectedConcert} onOpenChange={() => setSelectedConcert(null)}>
        <DialogContent className="bg-zinc-800 text-white border-zinc-700 max-w-3xl">
          {selectedConcert && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  {selectedConcert.konser_adi}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="relative h-[400px]">
                  <img
                    src={`https://cdn.bubilet.com.tr${selectedConcert.image}`}
                    alt={selectedConcert.konser_adi}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-zinc-300">Konser Detayları</h3>
                    <div className="space-y-1">
                      <p className="flex items-center text-zinc-400">
                        <span className="mr-2">📍</span>
                        <span className="font-medium text-white">{selectedConcert.mekan}</span>
                      </p>
                      <p className="flex items-center text-zinc-400">
                        <span className="mr-2">📅</span>
                        <span className="font-medium text-white">{selectedConcert.tarih}</span>
                      </p>
                      <p className="flex items-center text-zinc-400">
                        <span className="mr-2">⏰</span>
                        <span className="font-medium text-white">{selectedConcert.saat}</span>
                      </p>
                      <p className="flex items-center text-zinc-400">
                        <span className="mr-2">🏠</span>
                        <span className="font-medium text-white">{selectedConcert.adres}</span>
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-400">
                        {selectedConcert.fiyat}₺
                      </span>
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          addToCart(selectedConcert);
                          setSelectedConcert(null);
                        }}
                      >
                        Sepete Ekle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sepet Modalı */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="bg-zinc-800 text-white border-zinc-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Sepetim</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col h-[600px]">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <p className="text-center text-zinc-400">Sepetiniz boş</p>
              ) : (
                cart.map((item) => (
                  <div key={item.concert_id} className="flex items-center gap-4 p-4 bg-zinc-700/50 rounded-lg">
                    <img
                      src={`https://cdn.bubilet.com.tr${item.image}`}
                      alt={item.konser_adi}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.konser_adi}</h3>
                      <p className="text-sm text-zinc-400">{item.tarih} - {item.saat}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.concert_id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.concert_id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-semibold text-green-400">{item.fiyat * item.quantity}₺</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-500"
                      onClick={() => removeFromCart(item.concert_id)}
                    >
                      Kaldır
                    </Button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-zinc-700 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Toplam</span>
                  <span className="text-2xl font-bold text-green-400">{getTotalPrice()}₺</span>
                </div>
                <Button 
                  className="w-full mt-4 bg-green-500 hover:bg-green-600"
                  onClick={handleCheckout}
                >
                  Ödemeye Geç
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hiç konser yoksa */}
      {filtered.length === 0 && (
        <div className="text-zinc-400 mt-10 text-lg">Bu şehirde konser bulunamadı.</div>
      )}
    </div>
  );
}