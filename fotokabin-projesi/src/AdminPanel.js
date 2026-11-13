import { useState, useEffect, useCallback } from "react";
import "./AdminPanel.css";

const API = "http://localhost:3001/api/admin";

// ─── İSTATİSTİK KARTI ─────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className={"stat-card " + (color || "")}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value ?? "—"}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

// ─── TOPLU MESAJ MODALI ───────────────────────────────────────────────────────
function BroadcastModal({ onClose }) {
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(API + "/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, filter }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📢 Toplu WhatsApp Mesajı</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {result ? (
          <div className="modal-body">
            <div className={"result-box " + (result.success ? "ok" : "fail")}>
              {result.success
                ? "✅ Gönderildi! " +
                  result.sent +
                  " kişiye ulaştı, " +
                  result.failed +
                  " başarısız."
                : "❌ Hata: " + result.message}
            </div>
            <button className="admin-btn primary" onClick={onClose}>
              Kapat
            </button>
          </div>
        ) : (
          <div className="modal-body">
            <label className="field-label">Hedef Kitle</label>
            <div className="filter-row">
              {[
                { val: "all", label: "Tüm Müşteriler" },
                { val: "new_today", label: "Bugün Gelenler" },
                { val: "returning", label: "Tekrar Gelenler" },
              ].map((f) => (
                <button
                  key={f.val}
                  className={"filter-btn" + (filter === f.val ? " active" : "")}
                  onClick={() => setFilter(f.val)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <label className="field-label">Mesaj İçeriği</label>
            <textarea
              className="broadcast-textarea"
              placeholder="Örn: 🎉 Bu hafta %20 indirim! Bizi ziyaret edin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />

            <button
              className="admin-btn primary"
              disabled={!message.trim() || sending}
              onClick={send}
            >
              {sending ? "Gönderiliyor…" : "📤 Gönder"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANA ADMİN PANELİ ────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(API + "/stats");
      const data = await res.json();
      if (data.success) setStats(data);
    } catch {}
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 50,
        ...(search && { search }),
      });
      const res = await fetch(API + "/customers?" + params);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const deleteCustomer = async (phone) => {
    if (!window.confirm(phone + " numaralı müşteriyi silmek istiyor musun?"))
      return;
    try {
      await fetch(API + "/customers/" + encodeURIComponent(phone), {
        method: "DELETE",
      });
      fetchCustomers();
      fetchStats();
    } catch {}
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-app">
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">📸 Admin</div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              👥 Müşteriler
            </a>
            <a
              href="#"
              className="nav-item"
              onClick={(e) => {
                e.preventDefault();
                setShowModal(true);
              }}
            >
              📢 Toplu Mesaj
            </a>
          </nav>
        </aside>

        {/* İçerik */}
        <main className="admin-main">
          <div className="admin-header">
            <h1>Müşteri Yönetimi</h1>
            <button
              className="admin-btn primary"
              onClick={() => setShowModal(true)}
            >
              📢 Toplu Mesaj Gönder
            </button>
          </div>

          {/* İstatistikler */}
          <div className="stats-row">
            <StatCard
              icon="👥"
              label="Toplam Müşteri"
              value={stats?.totalCustomers}
              color="pink"
            />
            <StatCard
              icon="🆕"
              label="Bugün Yeni"
              value={stats?.todayNew}
              color="gold"
            />
            <StatCard
              icon="🔄"
              label="Bugün Ziyaret"
              value={stats?.todayVisit}
              color="green"
            />
          </div>

          {/* Arama */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Telefon numarasıyla ara…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="search-input"
            />
            <span className="search-count">{total} müşteri</span>
          </div>

          {/* Tablo */}
          <div className="table-wrap">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Telefon</th>
                  <th>Kayıt Tarihi</th>
                  <th>Son Ziyaret</th>
                  <th>Ziyaret</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="loading-row">
                      ⏳ Yükleniyor…
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="loading-row">
                      Müşteri bulunamadı.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.phone}>
                      <td className="phone-cell">{c.phone}</td>
                      <td>{formatDate(c.createdAt)}</td>
                      <td>{formatDate(c.lastVisit)}</td>
                      <td>
                        <span className="visit-badge">{c.visitCount}</span>
                      </td>
                      <td>
                        <button
                          className="icon-btn delete"
                          onClick={() => deleteCustomer(c.phone)}
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {total > 50 && (
            <div className="pagination">
              <button
                className="admin-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Önceki
              </button>
              <span>
                Sayfa {page} / {Math.ceil(total / 50)}
              </span>
              <button
                className="admin-btn"
                disabled={page * 50 >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Sonraki →
              </button>
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <BroadcastModal
          onClose={() => {
            setShowModal(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
