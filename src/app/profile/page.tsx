"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { ArrowLeft } from "lucide-react";

type UserProfile = {
  isim: string;
  soyisim: string;
  mail: string;
  yas: number;
  bakiye: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBakiyeDialogOpen, setIsBakiyeDialogOpen] = useState(false);
  const [bakiyeAmount, setBakiyeAmount] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8000/profile/", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Profil bilgileri alınamadı");
        }

        const data = await response.json();
        setProfile(data);
      } catch (error) {
        toast.error("Profil bilgileri yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleBakiyeAdd = async () => {
    const amount = parseFloat(bakiyeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Lütfen geçerli bir tutar giriniz");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/change-bakiye/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Bakiye eklenemedi");
      }

      const profileResponse = await fetch("http://localhost:8000/profile/", {
        credentials: "include",
      });

      if (!profileResponse.ok) {
        throw new Error("Profil bilgileri alınamadı");
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);
      setIsBakiyeDialogOpen(false);
      setBakiyeAmount("");
      toast.success("Bakiye başarıyla eklendi");
    } catch (error) {
      toast.error("Bakiye eklenirken bir hata oluştu");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/logout/", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Çıkış yapılamadı");
      }

      localStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      toast.error("Çıkış yapılırken bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-xl">Profil bilgileri bulunamadı</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kullanıcı Bilgileri */}
          <div className="bg-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Kullanıcı Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm">İsim</label>
                <div className="text-lg font-medium">{profile.isim}</div>
              </div>
              <div>
                <label className="text-zinc-400 text-sm">Soyisim</label>
                <div className="text-lg font-medium">{profile.soyisim}</div>
              </div>
              <div>
                <label className="text-zinc-400 text-sm">E-posta</label>
                <div className="text-lg font-medium">{profile.mail}</div>
              </div>
              <div>
                <label className="text-zinc-400 text-sm">Yaş</label>
                <div className="text-lg font-medium">{profile.yas}</div>
              </div>
            </div>
          </div>

          {/* Bakiye Bilgisi */}
          <div className="bg-zinc-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Bakiye</h2>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-400">
                {profile.bakiye}₺
              </div>
              <Button
                onClick={() => setIsBakiyeDialogOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bakiye Ekleme Dialog */}
      <Dialog open={isBakiyeDialogOpen} onOpenChange={setIsBakiyeDialogOpen}>
        <DialogContent className="bg-zinc-800 text-white border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Bakiye Ekle</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-zinc-400">Eklemek istediğiniz tutar</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={bakiyeAmount}
                onChange={(e) => setBakiyeAmount(e.target.value)}
                className="mt-1 bg-zinc-700 border-zinc-600 text-white"
                placeholder="0.00"
              />
            </div>
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={handleBakiyeAdd}
            >
              Bakiye Ekle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
