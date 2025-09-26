// /pages/payment/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PaymentStatus() {
  const { query } = useRouter();
  const id = query.id;
  const [info, setInfo] = useState({ status: "PENDING", total: 0 });

  // poll status setiap 3 detik (menunggu webhook Xendit update DB)
  useEffect(() => {
    if (!id) return;
    const fetchStatus = async () => {
      const r = await fetch(`/api/payments/${id}`);
      const j = await r.json();
      if (j.success) setInfo(j);
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 3000);
    return () => clearInterval(t);
  }, [id]);

  const human = info.status === "PAID" ? "LUNAS"
               : info.status === "EXPIRED" ? "KADALUARSA"
               : info.status === "CANCELLED" ? "DIBATALKAN"
               : "MENUNGGU PEMBAYARAN";

  return (
    <div style={{ padding: 24 }}>
      <h1>Status Pembayaran</h1>
      <p>Order: <b>{id}</b></p>
      <p>Total: <b>Rp{Number(info.total||0).toLocaleString()}</b></p>
      <p>Status: <b>{human}</b> ({info.status})</p>
      <a href="/">Kembali ke menu</a>
    </div>
  );
}
