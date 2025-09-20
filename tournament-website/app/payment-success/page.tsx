export default function PaymentSuccessPage({ searchParams }: { searchParams: { order_id?: string } }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Payment Success</h1>
        <p className="text-slate-300 mb-4">Thank you! Your payment has been processed.</p>
        {searchParams?.order_id && (
          <p className="text-slate-400 text-sm">Order ID: {searchParams.order_id}</p>
        )}
      </div>
    </div>
  )
}
