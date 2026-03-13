"use client";
import { useState } from 'react';

export default function AddressForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Add a new address</h2>
      
      <div>
        <label className="block text-sm font-bold mb-1">Full name (First and Last name)</label>
        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
      </div>
      
      <div>
        <label className="block text-sm font-bold mb-1">Phone number</label>
        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Email</label>
        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
      </div>
      
      <div>
        <label className="block text-sm font-bold mb-1">Address</label>
        <input required type="text" name="addressLine1" placeholder="Street address or P.O. Box" value={formData.addressLine1} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 mb-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
        <input type="text" name="addressLine2" placeholder="Apt, suite, unit, building, floor, etc." value={formData.addressLine2} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">City</label>
          <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">State</label>
          <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">ZIP Code</label>
          <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Country</label>
          <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none" />
        </div>
      </div>
      
      <div className="flex gap-4 mt-4">
        <button type="submit" className="bg-[#ffd814] hover:bg-[#f7bc19] rounded-lg py-2 px-4 shadow-sm text-sm font-medium">Use this address</button>
        {onCancel && <button type="button" onClick={onCancel} className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg py-2 px-4 shadow-sm text-sm font-medium">Cancel</button>}
      </div>
    </form>
  );
}