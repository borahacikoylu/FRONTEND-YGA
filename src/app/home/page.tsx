"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

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

const PAGE_SIZE = 24;

export default function HomePage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [filtered, setFiltered] = useState<Concert[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [cityName, setCityName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center py-10">
      {/* Arama ve şehir butonu */}
      <div className="w-full max-w-2xl mb-8 flex items-center gap-4">
        <Input
          className="bg-zinc-800 border-none text-white placeholder:text-zinc-400 flex-1 h-14 text-lg px-6"
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
      <div className="w-full overflow-x-auto hide-scrollbar" ref={scrollRef}>
        <div
          className="flex gap-x-8 py-4 flex-nowrap"
          style={{ minWidth: `${pagedConcerts.length * 370}px`, willChange: "transform" }}
        >
          {pagedConcerts.map((concert) => {
            const imageUrl = `https://cdn.bubilet.com.tr${concert.image}`;
            return (
              <div
                key={concert.concert_id}
                className="bg-zinc-800 rounded-xl shadow-lg flex flex-col items-center p-6 min-w-[350px] max-w-[350px] h-[480px]"
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
                <Button className="w-full mt-auto">Satın Al</Button>
              </div>
            );
          })}
        </div>
      </div>
      {/* Hiç konser yoksa */}
      {filtered.length === 0 && (
        <div className="text-zinc-400 mt-10 text-lg">Bu şehirde konser bulunamadı.</div>
      )}
    </div>
  );
}