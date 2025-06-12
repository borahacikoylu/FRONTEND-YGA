"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { useRouter } from 'next/navigation';
import { Ticket } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [isim, setIsim] = useState("");
  const [soyisim, setSoyisim] = useState("");
  const [yas, setYas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(mail)) {
      toast.error("Geçerli bir email adresi giriniz");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Giriş başarısız");
      }

      toast.success(data.message);

      localStorage.setItem("user", JSON.stringify({
        isim: data.isim,
        soyisim: data.soyisim,
        bakiye: data.bakiye,
      }));

      router.push('/home');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(mail)) {
      toast.error("Geçerli bir email adresi giriniz");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail, password, isim, soyisim, yas: parseInt(yas) }),
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Kayıt başarısız");
      }

      toast.success(data.message);
      setIsLogin(true);
      setMail("");
      setPassword("");
      setIsim("");
      setSoyisim("");
      setYas("");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kayıt olurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md anim-fade-in-up">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Hesabınıza Giriş Yapın" : "Yeni Hesap Oluşturun"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Biletlerinize ve etkinliklerinize erişmek için giriş yapın."
                : "Tüm etkinliklerden anında haberdar olmak için kaydolun."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="İsim" value={isim} onChange={(e) => setIsim(e.target.value)} required />
                  <Input placeholder="Soyisim" value={soyisim} onChange={(e) => setSoyisim(e.target.value)} required />
                  <Input type="number" min="18" placeholder="Yaş" value={yas} onChange={(e) => setYas(e.target.value)} required className="col-span-2" />
                </div>
              )}
              <Input type="email" placeholder="Email Adresiniz" value={mail} onChange={(e) => setMail(e.target.value)} required />
              <Input type="password" placeholder="Şifreniz" value={password} onChange={(e) => setPassword(e.target.value)} required />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isLogin ? "Giriş yapılıyor..." : "Hesap oluşturuluyor...") : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
              </Button>

              <Button type="button" variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full">
                {isLogin ? "Hesabınız yok mu? Kayıt Olun" : "Zaten hesabınız var mı? Giriş Yapın"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
