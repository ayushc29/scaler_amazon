"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import OrderTimeline from "../../components/OrderTimeline";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-medium mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 shadow-sm rounded-lg text-center">
          You have no orders.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Order Header */}
              <div className="bg-gray-100 p-4 border-b border-gray-200 flex flex-wrap justify-between gap-4 text-sm text-gray-600">
                <div>
                  <div className="uppercase text-xs">Order Placed</div>
                  <div>
                    {new Date(
                      order.createdAt || Date.now(),
                    ).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="uppercase text-xs">Total</div>
                  <div>₹{Number(order.totalAmount || 0).toFixed(2)}</div>
                </div>

                <div className="flex-1 text-right">
                  <div className="uppercase text-xs">Order ID #{order.id}</div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-[#007185] hover:underline"
                  >
                    View order details
                  </Link>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-4">
                <div className="font-bold text-lg mb-2 text-green-700">
                  {order.status || "Processing"}
                </div>

                {/* Tracking Timeline */}
                <OrderTimeline />

                {/* Ordered Products */}
                <div className="mt-4 flex flex-col gap-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16">
                        <Link
                          href={`/product/${item.productId}`}
                          className="block w-full h-full"
                        >
                          <Image
                            src={item.image || "/placeholder.png"}
                            alt={item.name || "Product"}
                            fill
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link
                          href={`/product/${item.productId}`}
                          className="text-[#007185] hover:underline font-medium"
                        >
                          {item.name}
                        </Link>

                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </div>

                        <div className="text-sm font-medium">
                          ₹{Number(item.price).toFixed(2)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/product/${item.productId}`}
                          className="border border-gray-300 rounded-full px-4 py-1 text-sm hover:bg-gray-100"
                        >
                          Buy it again
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
