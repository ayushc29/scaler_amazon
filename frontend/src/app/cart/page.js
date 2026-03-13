"use client";
import { useAppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import CartItem from '../../components/CartItem';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, refreshCart } = useAppContext();
  const router = useRouter();

  const handleUpdate = async (cartItemId, quantity) => {
    try {
      await api.updateCart(cartItemId, quantity);
      await refreshCart();
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await api.removeFromCart(cartItemId);
      await refreshCart();
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="max-w-[1500px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
      <div className="flex-1 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-medium mb-1">Shopping Cart</h1>
        <div className="text-right text-sm text-gray-500 mb-2 border-b border-gray-200 pb-2">Price</div>
        
        {cart?.items?.length > 0 ? (
          <div className="flex flex-col">
            {cart.items.map(item => (
              <CartItem 
                key={item.cartItemId} 
                item={item} 
                onUpdate={handleUpdate} 
                onRemove={handleRemove} 
              />
            ))}
            <div className="text-right text-lg font-medium mt-4">
              Subtotal ({itemCount} items): <span className="font-bold">₹{Number(cart.subtotal).toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-lg">Your Amazon Cart is empty.</div>
        )}
      </div>

      {cart?.items?.length > 0 && (
        <div className="w-full md:w-80 bg-white p-6 shadow-sm h-fit">
          <div className="text-lg mb-4">
            Subtotal ({itemCount} items): <span className="font-bold">₹{Number(cart.subtotal).toFixed(2)}</span>
          </div>
          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-[#ffd814] hover:bg-[#f7bc19] rounded-lg py-2 shadow-sm text-sm font-medium"
          >
            Proceed to checkout
          </button>
        </div>
      )}
    </div>
  );
}