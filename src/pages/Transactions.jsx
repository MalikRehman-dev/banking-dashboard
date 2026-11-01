import { useState } from "react";
import { useBank } from "../context/BankContext";
import { typeLabels } from "../utils/format";
import TransactionTable from "../components/TransactionTable";

const PER_PAGE = 8;

export default function Transactions() {
  const { myTransactions } = useBank();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Filter
  let list = myTransactions.filter((t) => {
    const text = search.trim().toLowerCase();
    const matchSearch = !text || t.ref.toLowerCase().includes(text) || t.otherName.toLowerCase().includes(text);
    const matchType = type === "all" || t.type === type;
    const matchStatus = status === "all" || t.status === status;
    return matchSearch && matchType && matchStatus;
  });

  // Sort
  list = [...list].sort((a, b) => {
    if (sort === "newest") return new Date(b.date) - new Date(a.date);
    if (sort === "oldest") return new Date(a.date) - new Date(b.date);
    if (sort === "high") return b.amount - a.amount;
    return a.amount - b.amount;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = list.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Filter badalne par page 1 par wapas
  function change(setter) {
    return (e) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <div>
      <h2 className="page-title">Transaction history</h2>

      <div className="filters">
        <input className="input" placeholder="Search by reference or name" value={search} onChange={change(setSearch)} />
        <select className="input" value={type} onChange={change(setType)}>
          <option value="all">All types</option>
          {Object.keys(typeLabels).map((k) => (
            <option key={k} value={k}>{typeLabels[k]}</option>
          ))}
        </select>
        <select className="input" value={status} onChange={change(setStatus)}>
          <option value="all">All status</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
        </select>
        <select className="input" value={sort} onChange={change(setSort)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="high">Amount: high to low</option>
          <option value="low">Amount: low to high</option>
        </select>
      </div>

      <div className="panel">
        {list.length === 0 && myTransactions.length > 0 ? (
          <p className="empty">No transactions match your filters.</p>
        ) : (
          <TransactionTable transactions={pageItems} />
        )}

        {list.length > PER_PAGE && (
          <div className="pagination">
            <button className="btn btn-small" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="btn btn-small" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
