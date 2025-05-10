"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
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

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.code.includes(search)
  );

  const handleSelect = (city: { code: string; name: string }) => {
    setSelected(city.code);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCity", JSON.stringify(city));
    }
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex bg-zinc-900 text-white">
      {/* Sol panel */}
      <div className="w-[400px] flex flex-col items-start px-12 bg-zinc-950 pt-16">
        <h1 className="text-4xl font-bold mb-8">Şehir Seç</h1>
        <Input
          className="mb-6 bg-zinc-800 border-none text-white placeholder:text-zinc-400"
          placeholder="Şehir Ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-lg font-semibold mb-4">
          Şubilet'te şehrine özel tüm etkinlikler bir tık uzağında!
        </p>
        <p className="text-md mb-8">
          Şehrini seçip eğlenceye başla.
        </p>
        {!selected && (
          <span className="text-red-400 font-semibold">Lütfen bir şehir seçin.</span>
        )}
      </div>
      {/* Sağ panel */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-6xl px-4">
          <div className="grid grid-cols-12 gap-4">
            {filteredCities.map((city) => (
              <button
                key={city.code}
                className={clsx(
                  "w-full aspect-square rounded-xl flex flex-col items-center justify-center text-base font-bold border-2 transition-all transition-transform duration-300 hover:scale-105 hover:shadow-2xl",
                  selected === city.code
                    ? "bg-green-500 border-green-300 text-white scale-105 shadow-lg"
                    : "bg-zinc-800 border-zinc-700 hover:bg-green-700 hover:text-white"
                )}
                onClick={() => handleSelect(city)}
              >
                <span className="text-lg">{city.code}</span>
                <span className="text-xs">{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}