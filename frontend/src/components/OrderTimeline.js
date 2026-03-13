export default function OrderTimeline() {

  const steps = [
    "Placed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
  ];

  return (
    <div className="flex items-center gap-6 mt-3 text-xs">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-green-600" : "bg-gray-300"}`}></div>
          <span className={i === 0 ? "text-green-700 font-medium" : "text-gray-500"}>
            {step}
          </span>
          {i !== steps.length - 1 && (
            <div className="w-12 h-[2px] bg-gray-300"></div>
          )}
        </div>
      ))}
    </div>
  );
}