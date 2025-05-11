"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [isim, setIsim] = useState("");
  const [soyisim, setSoyisim] = useState("");
  const [yas, setYas] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        user_id: data.user_id
      }));

      window.location.href = "/";

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail,
          password,
          isim,
          soyisim,
          yas: parseInt(yas)
        }),
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Kayıt başarısız");
      }

      toast.success(data.message);
      setIsLogin(true); // Switch to login form after successful registration
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
                <div className="space-y-2">
                  <label htmlFor="isim" className="text-sm font-medium">
                    İsim
                  </label>
                  <Input
                    id="isim"
                    type="text"
                    placeholder="İsminiz"
                    value={isim}
                    onChange={(e) => setIsim(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="soyisim" className="text-sm font-medium">
                    Soyisim
                  </label>
                  <Input
                    id="soyisim"
                    type="text"
                    placeholder="Soyisminiz"
                    value={soyisim}
                    onChange={(e) => setSoyisim(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="yas" className="text-sm font-medium">
                    Yaş
                  </label>
                  <Input
                    id="yas"
                    type="number"
                    placeholder="Yaşınız"
                    value={yas}
                    onChange={(e) => setYas(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label htmlFor="mail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="mail"
                type="email"
                placeholder="ornek@email.com"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Şifre
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? (isLogin ? "Giriş yapılıyor..." : "Kayıt yapılıyor...") 
                : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMail("");
                  setPassword("");
                  setIsim("");
                  setSoyisim("");
                  setYas("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isLogin ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
