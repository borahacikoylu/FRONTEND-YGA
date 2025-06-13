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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { ArrowLeft, LogOut, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [editIsim, setEditIsim] = useState("");
  const [editSoyisim, setEditSoyisim] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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
        setEditIsim(data.isim);
        setEditSoyisim(data.soyisim);
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

  const handleSaveUserInfo = async () => {
    if (!editIsim || !editSoyisim) {
      toast.error("İsim ve soyisim boş olamaz");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/update-user/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isim: editIsim, soyisim: editSoyisim }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Güncelleme başarısız");
      }
      const data = await response.json();
      setProfile((prev) => prev ? { ...prev, isim: data.isim, soyisim: data.soyisim } : prev);
      toast.success("Kullanıcı bilgileri güncellendi");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-xl">Profil bilgileri bulunamadı. Lütfen tekrar giriş yapın.</div>
        <Button onClick={() => router.push('/login')} className="mt-4">Giriş Sayfasına Dön</Button>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground"
            onClick={() => router.push("/home")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Button>

          <Card className="anim-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <UserCircle className="w-10 h-10 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Profil</CardTitle>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* User Info */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-lg font-medium text-foreground">Kullanıcı Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">İsim</label>
                      {isEditing ? (
                        <Input
                          value={editIsim}
                          onChange={e => setEditIsim(e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-base font-semibold">{profile.isim}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Soyisim</label>
                      {isEditing ? (
                        <Input
                          value={editSoyisim}
                          onChange={e => setEditSoyisim(e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-base font-semibold">{profile.soyisim}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-muted-foreground">E-posta</label>
                      <p className="text-base font-semibold">{profile.mail}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Yaş</label>
                      <p className="text-base font-semibold">{profile.yas}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={handleSaveUserInfo}>Kaydet</Button>
                        <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditIsim(profile.isim); setEditSoyisim(profile.soyisim); }}>İptal</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Düzenle</Button>
                    )}
                  </div>
                </div>
                
                {/* Bakiye Bilgisi */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-foreground">Bakiye</h3>
                  <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
                    <span className="text-3xl font-bold text-primary">{profile.bakiye}₺</span>
                    <Button onClick={() => setIsBakiyeDialogOpen(true)}>
                      Bakiye Ekle
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bakiye Ekleme Dialog */}
      <Dialog open={isBakiyeDialogOpen} onOpenChange={setIsBakiyeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bakiye Ekle</DialogTitle>
            <DialogDescription>
              Hesabınıza eklemek istediğiniz tutarı girin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="number"
              min="1"
              value={bakiyeAmount}
              onChange={(e) => setBakiyeAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBakiyeDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleBakiyeAdd}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
