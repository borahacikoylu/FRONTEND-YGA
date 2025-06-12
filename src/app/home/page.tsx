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
import { ShoppingCart, User, Share2 } from "lucide-react";
import { toast, Toaster } from "sonner";

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
  yorumlar: Comment[];
};

type CartItem = Concert & {
  quantity: number;
};

type Comment = {
  kullanici: string;
  yorum: string;
  tarih: string;
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem("user") !== null;

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

  useEffect(() => {
    if (selectedConcert) {
      const formattedComments = (selectedConcert.yorumlar || [])
        .map(comment => ({
          ...comment,
          tarih: new Date(comment.tarih).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
        }))
        .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
      setComments(formattedComments);
    } else {
      setComments([]);
    }
  }, [selectedConcert]);

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
          if (response.status === 400) {
            toast.error("Bakiye yetersiz");
            return;
          }
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsProfileOpen(false);
    router.push("/login");
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedConcert) return;

    if (!isLoggedIn) {
      toast.error("Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    const userString = localStorage.getItem("user");
    if (!userString) {
      toast.error("Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.");
      router.push("/login");
      return;
    }
    const user = JSON.parse(userString);

    try {
      const response = await fetch("http://localhost:8000/add-comment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          concert_id: selectedConcert.concert_id,
          content: newComment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Yorum eklenemedi.");
      }

      const newCommentData: Comment = {
        kullanici: user.isim || "Siz",
        yorum: newComment,
        tarih: new Date().toLocaleString("tr-TR", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      
      setComments((prevComments) => [newCommentData, ...prevComments]);
      setNewComment("");
      toast.success(data.detail || "Yorum başarıyla eklendi.");

    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Yorum eklenirken bir hata oluştu."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-28 pb-10">
      <Toaster richColors position="top-center" />
      {/* Üst Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-50 anim-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              className="w-64 h-10"
              placeholder="Konser veya sanatçı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {cityName && (
              <Button
                variant="outline"
                className="whitespace-nowrap"
                onClick={() => router.push("/")}
              >
                {cityName}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
              <span className="sr-only">Sepeti aç</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              onClick={() => setIsProfileOpen(true)}
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Profili aç</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Dropdown */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isLoggedIn ? "Profil" : "Hesap"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {isLoggedIn ? (
              <>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/tickets");
                  }}
                >
                  <span className="mr-2">🎫</span> Biletlerim
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/profile");
                  }}
                >
                  <span className="mr-2">👤</span> Profilim
                </Button>
                <Button 
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <span className="mr-2">🚪</span> Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="w-full"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/login");
                  }}
                >
                  <span className="mr-2">🔑</span> Giriş Yap
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/login"); // Assuming register is on the same page
                  }}
                >
                  <span className="mr-2">✍️</span> Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Konser Kartları */}
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 anim-fade-in-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pagedConcerts.map((concert, index) => {
            const imageUrl = `https://cdn.bubilet.com.tr${concert.image}`;
            const isButtonClicked = clickedButtonId === concert.concert_id;
            return (
              <div
                key={concert.concert_id}
                className="bg-card rounded-lg shadow-md flex flex-col group cursor-pointer overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 card-glow anim-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedConcert(concert)}
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={concert.konser_adi}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
                    {concert.konser_adi}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <span className="mr-1.5">📍</span>
                    <span className="truncate">{concert.mekan}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <span className="mr-1.5">📅</span>
                    <span>{concert.tarih}</span>
                  </div>
                  <div className="flex-grow" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-primary font-semibold text-lg">
                      {concert.fiyat}₺
                    </div>
                    <Button 
                      size="sm"
                      className={`relative overflow-hidden transition-all duration-300 ${
                        isButtonClicked ? 'bg-primary/90 scale-95' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setClickedButtonId(concert.concert_id);
                        addToCart(concert);
                        setTimeout(() => setClickedButtonId(null), 300);
                      }}
                    >
                      <span className={`transition-transform duration-300 ${
                        isButtonClicked ? 'scale-90' : ''
                      }`}>
                        {isButtonClicked ? 'Eklendi!' : 'Sepete Ekle'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Konser Detay Modalı */}
      <Dialog open={!!selectedConcert} onOpenChange={() => setSelectedConcert(null)}>
        <DialogContent className="max-w-4xl">
          {selectedConcert && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-center mb-2">
                  {selectedConcert.konser_adi}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div className="relative h-[450px] rounded-lg overflow-hidden">
                  <img
                    src={`https://cdn.bubilet.com.tr${selectedConcert.image}`}
                    alt={selectedConcert.konser_adi}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col space-y-4 pt-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-primary">Konser Detayları</h3>
                     <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (!selectedConcert) return;
                        const concertUrl = `${window.location.origin}/home?concert=${selectedConcert.concert_id}`;
                        navigator.clipboard.writeText(concertUrl);
                        toast.success("URL Kopyalandı!");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center"><span className="text-muted-foreground w-20">Mekan:</span> <span className="font-semibold">{selectedConcert.mekan}</span></p>
                    <p className="flex items-center"><span className="text-muted-foreground w-20">Tarih:</span> <span className="font-semibold">{selectedConcert.tarih}</span></p>
                    <p className="flex items-center"><span className="text-muted-foreground w-20">Saat:</span> <span className="font-semibold">{selectedConcert.saat}</span></p>
                    <p className="flex items-center"><span className="text-muted-foreground w-20">Adres:</span> <span className="font-semibold">{selectedConcert.adres}</span></p>
                  </div>
                  <div className="flex-grow" />
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-primary">
                        {selectedConcert.fiyat}₺
                      </span>
                      <Button 
                        size="lg"
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
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xl font-bold mb-4">Yorumlar</h3>
                {isLoggedIn ? (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-6">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Yorumunuzu yazın..."
                      className="flex-grow"
                    />
                    <Button type="submit">Yorum Yap</Button>
                  </form>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg mb-6">
                    <p className="text-muted-foreground">
                      Yorum yapmak için{' '}
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => router.push('/login')}>
                        giriş yapmalısınız
                      </Button>.
                    </p>
                  </div>
                )}
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div key={index} className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-foreground">{comment.kullanici}</p>
                          <p className="text-xs text-muted-foreground">{comment.tarih}</p>
                        </div>
                        <p className="text-foreground/90 break-words">{comment.yorum}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Henüz yorum yok. İlk yorumu siz yapın!</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sepet Modalı */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Sepetim</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col h-[500px]">
            <div className="flex-grow overflow-y-auto -mr-4 pr-4 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground pt-10">Sepetiniz boş</p>
              ) : (
                cart.map((item) => (
                  <div key={item.concert_id} className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg">
                    <img
                      src={`https://cdn.bubilet.com.tr${item.image}`}
                      alt={item.konser_adi}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.konser_adi}</h3>
                      <p className="text-sm text-muted-foreground">{item.tarih} - {item.saat}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.concert_id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.concert_id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-semibold text-primary">{item.fiyat * item.quantity}₺</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.concert_id)}
                    >
                      Kaldır
                    </Button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Toplam Tutar</span>
                  <span className="text-2xl font-bold text-primary">{getTotalPrice()}₺</span>
                </div>
                <Button 
                  size="lg"
                  className="w-full mt-4"
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
      {pagedConcerts.length === 0 && concerts.length > 0 && (
        <div className="text-muted-foreground mt-10 text-lg anim-fade-in">Aradığınız kriterlere uygun konser bulunamadı.</div>
      )}
      {concerts.length === 0 && (
        <div className="text-muted-foreground mt-10 text-lg anim-fade-in">Bu şehirde gösterilecek konser bulunamadı.</div>
      )}
    </div>
  );
}