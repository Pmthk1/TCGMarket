'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';

const Card9 = () => {
  const router = useRouter();
  const { addToCart } = useCart();

  const product = {
    id: 'eevee-ex',
    name: 'อีวุย EX',
    price: 350,
    image: '/images/eevee-ex.png',
    quantity: 1,
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="p-8 bg-blue-100 min-h-screen flex flex-col items-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl border border-gray-300 flex">
        
        {/* ปุ่ม Close ที่จะกลับไปหน้าหลัก */}
        <button 
          className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
          onClick={() => router.push('/products')}
        >
          <X size={24} className="text-gray-600" />
        </button>

        <div className="flex items-center space-x-4">
          <Image 
            src="/images/eevee-ex.png" 
            alt="อีวุย EX" 
            width={280} 
            height={420} 
            className="rounded-xl shadow-lg" 
          />
          <div className="text-left">
            <p className="text-lg font-semibold">
              ชื่อสินค้า: <span className="font-normal">อีวุย EX</span>
            </p>
            <p className="text-lg font-semibold mt-2 text-green-600">รายละเอียดสินค้า:</p>
            <p className="mt-1">
              อีวุย EX ประเภทการ์ด: สเตลลาร์ มาแล้ว! <br />
              ด้วยความสามารถ <strong>[DNA สว่าง]</strong> ทำให้โปเกมอนนี้สามารถวิวัฒนาการเป็นโปเกมอน EX ตัวไหนก็ได้ที่วิวัฒนาการได้จาก [อีวุย]!<br />
              มาเลือกประเภทที่จะวิวัฒนาการเพื่อสร้างความเหนือชั้นในเชิงกลยุทธ์กันไปเลย!<br />
              ท่าต่อสู้ <strong>[คอสมีชโซน]</strong> สามารถโชว์ฟอร์มเป็นตัวโมดมีตัวเจ้าได้โดยสามารถทำแดเมจได้ถึง <strong>200</strong>!
            </p>

            <p className="text-lg font-bold mt-4 text-red-500">
              ราคา: ฿350
            </p>

            <div className="flex items-center mt-4">
              <button 
                onClick={handleAddToCart} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow"
              >
                เพิ่มใส่ตะกร้า
              </button>
              <Image 
                src="/images/anime1.png" 
                alt="anime icon" 
                width={50} 
                height={50} 
                className="ml-4" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card9;
