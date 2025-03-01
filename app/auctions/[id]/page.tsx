"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CountdownTimer from "@/components/ui/CountdownTimer";

type Auction = {
  id: string;
  card?: { imageUrl?: string; name?: string };
  startPrice?: number;
  currentPrice?: number;
  endTime?: string;
};

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ไม่พบรหัสการประมูล");
      setLoading(false);
      return;
    }

    const fetchAuction = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/auctions/${id}?t=${Date.now()}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "ไม่สามารถดึงข้อมูลประมูลได้");
        }

        const data: Auction = await res.json();
        console.log("ข้อมูลประมูลที่ได้รับ:", data);
        console.log("URL รูปภาพ:", data.card?.imageUrl);
        
        // ถ้าไม่มี imageUrl แต่มีชื่อการ์ด ให้ลองค้นหารูปภาพจากชื่อการ์ด
        if (!data.card?.imageUrl && data.card?.name) {
          try {
            const imageRes = await fetch(`/api/find-images?cardName=${encodeURIComponent(data.card.name)}`);
            if (imageRes.ok) {
              const imageData = await imageRes.json();
              if (imageData.imageUrl) {
                console.log("พบรูปภาพจากชื่อการ์ด:", imageData.imageUrl);
                setFallbackImage(imageData.imageUrl);
              } else {
                // เพิ่มกรณีไม่พบรูปภาพ ลองใช้ชื่อไฟล์โดยตรง
                setFallbackImage(`/uploads/${data.card.name.toLowerCase().replace(/\s+/g, '-')}.png?t=${Date.now()}`);
              }
            }
          } catch (imgErr) {
            console.error("ไม่สามารถค้นหารูปภาพจากชื่อการ์ดได้:", imgErr);
          }
        }
        
        setAuction(data);
        setError("");

        if (data.endTime) {
          const auctionEndTime = new Date(data.endTime).getTime();
          setTimeLeft(auctionEndTime - Date.now());

          const interval = setInterval(() => {
            const remainingTime = auctionEndTime - Date.now();
            setTimeLeft(remainingTime);
            if (remainingTime <= 0) {
              clearInterval(interval);
              router.push("/auctions/closed");
            }
          }, 1000);

          return () => clearInterval(interval);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลการประมูลได้"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id, router]);

  const placeBid = async () => {
    if (!auction || !auction.startPrice) return;

    const bidValue = Number(bidAmount);
    const minBid = auction.currentPrice ?? auction.startPrice;

    if (isNaN(bidValue) || bidValue <= minBid) {
      alert(`กรุณาเสนอราคามากกว่าราคาปัจจุบัน (${minBid.toLocaleString()} บาท)`);
      return;
    }

    try {
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidAmount: bidValue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "ไม่สามารถเสนอราคาได้");
      }

      const updatedAuction = await res.json();
      setAuction(updatedAuction);
      setBidAmount("");
      setIsBidOpen(false);
      alert("เสนอราคาสำเร็จ!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเสนอราคา");
    }
  };

  const handleImageError = () => {
    console.error("เกิดข้อผิดพลาดในการโหลดรูปภาพจาก URL:", auction?.card?.imageUrl);
    setImageError(true);
  };

  if (loading) return <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>;
  if (error) return <p className="text-center text-red-500">ข้อผิดพลาด: {error}</p>;
  if (!auction) return <p className="text-center text-gray-500">ไม่พบข้อมูลการประมูล</p>;

  // ใช้ URL รูปภาพจากการ์ดหรือรูปภาพสำรองที่ค้นหาจากชื่อการ์ด
  const imageUrl = !imageError && auction.card?.imageUrl 
    ? auction.card.imageUrl 
    : (imageError && fallbackImage ? fallbackImage : fallbackImage);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{auction.card?.name || "ไม่ทราบชื่อสินค้า"}</h1>
      {timeLeft !== null && timeLeft > 0 ? (
        <CountdownTimer endTime={auction.endTime!} />
      ) : (
        <p className="text-red-600 text-lg font-bold">หมดเวลาการประมูล</p>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {imageUrl && (
          <div className="relative w-[300px] h-[400px] rounded-lg mx-auto md:mx-0 bg-gray-100">
            <Image
              src={imageUrl}
              alt={auction.card?.name || "ไม่มีชื่อสินค้า"}
              fill
              className="rounded-lg object-contain"
              unoptimized
              onError={handleImageError}
            />
          </div>
        )}
        {!imageUrl && auction.card?.name && (
          <div className="w-[300px] h-[400px] rounded-lg mx-auto md:mx-0 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500 p-4 text-center">ไม่พบรูปภาพสำหรับ {auction.card.name}</p>
          </div>
        )}
        <div>
          <p className="text-lg text-gray-500">💰 ราคาเริ่มต้น: {auction.startPrice?.toLocaleString()} บาท</p>
          <p className="text-lg font-bold text-green-500">🔥 ราคาปัจจุบัน: {auction.currentPrice?.toLocaleString()} บาท</p>
          
          <Button onClick={() => router.push("/auctions/live")} className="bg-blue-500 hover:bg-blue-600 mt-4">
            กลับไปหน้าหลักประมูล
          </Button>

          {timeLeft !== null && timeLeft > 0 && (
            <Button onClick={() => setIsBidOpen(true)} className="bg-orange-500 hover:bg-orange-600 mt-4">
              เสนอราคา
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isBidOpen} onOpenChange={setIsBidOpen}>
        <DialogContent title="เสนอราคา">
          <Input
            type="number"
            placeholder="กรอกราคาที่ต้องการเสนอ"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="mb-2"
          />
          <DialogFooter>
            <Button onClick={() => setIsBidOpen(false)} variant="outline">ยกเลิก</Button>
            <Button onClick={placeBid} className="bg-orange-500 hover:bg-orange-600">
              ยืนยันการเสนอราคา
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}