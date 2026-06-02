"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber, formatPKR } from "@/lib/utils";
import { brickGradeLabel } from "@/lib/brick-grade";
import type { BrickGrade } from "@prisma/client";

export default function ChallanPrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    challanNo: string;
    truckNumber: string;
    driverName: string;
    driverPhone: string | null;
    bricksLoaded: number;
    dispatchDate: string;
    order: {
      orderNumber: string;
      brickGrade: string;
      quantity: number;
      totalAmount: number;
      customer: { name: string; phone: string; address: string | null; city: string | null };
    };
    biltyNo: string | null;
    transporterName: string | null;
    freightAmount: string | number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/dispatch/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); });
  }, [id]);

  if (!data) return <p className="p-8">Loading challan...</p>;

  return (
    <div className="min-h-screen bg-white p-8 text-black print:p-4">
      <div className="mb-6 flex justify-between print:hidden">
        <Button onClick={() => window.print()}>Print Challan</Button>
        <Button variant="outline" onClick={() => window.close()}>Close</Button>
      </div>
      <div className="mx-auto max-w-2xl border-2 border-black p-8">
        <h1 className="text-center text-2xl font-bold">Smart Brick Agency</h1>
        <p className="text-center text-sm">Delivery Challan / ڈیلیوری چالان</p>
        <hr className="my-4 border-black" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Challan:</strong> {data.challanNo}</p>
            <p><strong>Date:</strong> {formatDate(data.dispatchDate)}</p>
            <p><strong>Order:</strong> {data.order.orderNumber}</p>
            {data.biltyNo && <p><strong>Bilty:</strong> {data.biltyNo}</p>}
          </div>
          <div>
            <p><strong>Truck:</strong> {data.truckNumber}</p>
            {data.transporterName && <p><strong>Transporter:</strong> {data.transporterName}</p>}
            <p><strong>Driver:</strong> {data.driverName}</p>
            {data.driverPhone && <p><strong>Phone:</strong> {data.driverPhone}</p>}
          </div>
        </div>
        <hr className="my-4 border-black" />
        <h2 className="font-bold">Customer / گاہک</h2>
        <p>{data.order.customer.name}</p>
        <p>{data.order.customer.phone}</p>
        <p>{data.order.customer.address} {data.order.customer.city}</p>
        <hr className="my-4 border-black" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-right">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">
                {brickGradeLabel(data.order.brickGrade as BrickGrade, "en")}
              </td>
              <td className="py-2 text-right font-bold">{formatNumber(data.bricksLoaded)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-gray-600">Order total: {formatPKR(Number(data.order.totalAmount))} | Order qty: {formatNumber(data.order.quantity)}</p>
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm">
          <div><hr className="border-black" /><p>Driver Signature</p></div>
          <div><hr className="border-black" /><p>Receiver Signature</p></div>
        </div>
      </div>
    </div>
  );
}
