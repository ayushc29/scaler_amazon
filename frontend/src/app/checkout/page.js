"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "../../context/AppContext";
import AddressForm from "../../components/AddressForm";

function CheckoutContent() {
  const { cart, refreshCart } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get("productId");
  const buyNowQty = Number(searchParams.get("qty") || 1);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await api.getAddresses();
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  useEffect(() => {
    const loadBuyNowProduct = async () => {
      if (!buyNowProductId) return;

      try {
        const res = await api.getProduct(buyNowProductId);
        const p = res.product;

        setBuyNowItem({
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: buyNowQty,
          image: res.images?.[0]?.imageUrl,
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadBuyNowProduct();
  }, [buyNowProductId, buyNowQty]);

  const handleAddAddress = async (formData) => {
    try {
      await api.addAddress(formData);
      const data = await api.getAddresses();
      setAddresses(data);
      setSelectedAddressId(data[data.length - 1].id);
      setShowAddressForm(false);
    } catch (err) {
      alert("Failed to add address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      setDeletingId(id);
      await api.deleteAddress(id);

      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);

      if (selectedAddressId === id) {
        setSelectedAddressId(updated[0]?.id ?? null);
      }

      if (updated.length === 0) {
        setShowAddressForm(true);
      }

      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select an address");
      return;
    }

    setPlacingOrder(true);

    try {
      const res = await api.checkout(
        selectedAddressId,
        buyNowProductId,
        buyNowQty,
      );

      if (!buyNowProductId) {
        await refreshCart();
      }

      router.push(`/orders/${res.orderId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
      setPlacingOrder(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading checkout...</div>;
  if (!buyNowProductId && (!cart || cart.items?.length === 0))
    return <div className="p-8 text-center">Your cart is empty.</div>;

  const checkoutItems = buyNowItem ? [buyNowItem] : cart.items;

  const subtotal = buyNowItem
    ? Number(buyNowItem.price) * buyNowItem.quantity
    : Number(cart.subtotal);

  const itemCount = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-medium mb-6">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          {/* Address Selection */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-bold mb-4">1. Shipping address</h2>
            {addresses.length > 0 && !showAddressForm ? (
              <div>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex justify-between items-start gap-3 mb-3 p-3 border rounded border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        id={`addr-${addr.id}`}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />

                      <label
                        htmlFor={`addr-${addr.id}`}
                        className="cursor-pointer"
                      >
                        <div className="font-bold">{addr.name}</div>
                        <div>
                          {addr.addressLine1} {addr.addressLine2}
                        </div>
                        <div>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </div>
                        <div>{addr.country}</div>
                        <div className="text-sm text-gray-500">
                          Phone: {addr.phone}
                        </div>
                      </label>
                    </div>

                    {confirmDeleteId === addr.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-600 text-sm font-bold"
                          disabled={deletingId === addr.id}
                        >
                          {deletingId === addr.id ? "Deleting..." : "Confirm"}
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-gray-500 text-sm hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(addr.id)}
                        className="text-red-500 text-sm hover:underline font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-[#007185] hover:underline text-sm mt-2"
                >
                  + Add a new address
                </button>
              </div>
            ) : (
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={
                  addresses.length > 0 ? () => setShowAddressForm(false) : null
                }
              />
            )}
          </div>

          {/* Items Review */}
          <div className="bg-white p-6 shadow-sm rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              2. Review items and shipping
            </h2>

            <div className="border border-gray-200 rounded p-4 flex flex-col gap-6">
              {checkoutItems.map((item, idx) => (
                <div
                  key={item.cartItemId ?? `buy-${item.productId}-${idx}`}
                  className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  {/* Left side */}
                  <div className="flex gap-4">
                    <div className="w-20 h-20 relative shrink-0">
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
                        <div className="font-medium text-[#007185] hover:underline">
                          {item.name}
                        </div>
                      </Link>

                      <div className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>

                  {/* Right side price */}
                  <div className="font-bold text-lg whitespace-nowrap">
                    ₹{Number(item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-80 h-fit">
          <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-200">
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId}
              className="w-full bg-[#ffd814] hover:bg-[#f7bc19] rounded-lg py-2 shadow-sm text-sm font-medium mb-4 disabled:opacity-50"
            >
              {placingOrder ? "Placing Order..." : "Place your order"}
            </button>

            <h3 className="font-bold text-lg mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm mb-1">
              <span>Items ({itemCount}):</span>
              <span>₹{Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Shipping & handling:</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between text-sm mb-3 pb-3 border-b border-gray-200">
              <span>Total before tax:</span>
              <span>₹{Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-[#b12704]">
              <span>Order total:</span>
              <span>₹{Number(subtotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}