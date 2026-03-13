"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../../lib/api";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.getOrder(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading)
    return <div className="p-8 text-center">Loading order details...</div>;
  if (!data || !data.order)
    return <div className="p-8 text-center">Order not found.</div>;

  const { order, items, address } = data;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-medium">Order Details</h1>
      </div>

      <div className="flex gap-4 text-sm mb-6">
        <span>
          Ordered on{" "}
          {new Date(order.createdAt || Date.now()).toLocaleDateString()}
        </span>
        <span className="w-px bg-gray-300"></span>
        <span>Order# {order.id}</span>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-gray-200">
          <div>
            <div className="font-bold mb-1">Shipping Address</div>
            <div className="text-sm text-gray-700">
              <div className="text-sm text-gray-700 leading-5">
                {address ? (
                  <>
                    <div>{address.name}</div>
                    <div>{address.addressLine1}</div>
                    {address.addressLine2 && <div>{address.addressLine2}</div>}
                    <div>
                      {address.city}, {address.state} {address.postalCode}
                    </div>
                    <div>{address.country}</div>
                    <div>Phone: {address.phone}</div>
                  </>
                ) : (
                  <div className="text-gray-500">No address available</div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="font-bold mb-1">Payment Method</div>
            <div className="text-sm text-gray-700">Standard Payment</div>
          </div>
          <div>
            <div className="font-bold mb-1">Order Summary</div>
            <div className="text-sm text-gray-700 flex justify-between">
              <span>Item(s) Subtotal:</span>
              <span>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-700 flex justify-between font-bold mt-2">
              <span>Grand Total:</span>
              <span>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-green-700">
            {order.status || "Preparing for Shipment"}
          </h2>

          <div className="flex flex-col gap-6">
            {items &&
              items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-24 h-24 relative shrink-0">
                    <Link href={`/product/${item.productId}`}>
                      <Image
                        src={
                          item.image ||
                          "https://picsum.photos/seed/amazon/200/200"
                        }
                        alt={item.name || "Product"}
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                  </div>
                  <div>
                    <Link href={`/product/${item.productId}`}>
                      <div className="font-medium text-[#007185] hover:underline cursor-pointer">
                        {item.name}
                      </div>
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">Sold by: Amazon Clone</div>
                    <div className="font-bold mt-1">₹{Number(item.price).toFixed(2)}</div>
                    <div className="text-sm mt-1">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}