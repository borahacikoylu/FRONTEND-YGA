"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <>
                <Input placeholder="İsim" value={isim} onChange={(e) => setIsim(e.target.value)} required />
                <Input placeholder="Soyisim" value={soyisim} onChange={(e) => setSoyisim(e.target.value)} required />
                <Input type="number" min="18" placeholder="Yaş" value={yas} onChange={(e) => setYas(e.target.value)} required />
              </>
            )}
            <Input type="email" placeholder="Email" value={mail} onChange={(e) => setMail(e.target.value)} required />
            <Input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isLogin ? "Giriş yapılıyor..." : "Kayıt yapılıyor...") : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
            </Button>

            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-600 hover:text-blue-800 w-full">
              {isLogin ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
