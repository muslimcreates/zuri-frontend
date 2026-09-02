import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError, type AdminProductInput } from "../../lib/api";
import type { Category, FulfillmentType } from "../../lib/types";

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceTRY, setPriceTRY] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("STOCKED");
  const [stock, setStock] = useState("0");
  const [leadTimeDays, setLeadTimeDays] = useState("14");
  const [active, setActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.categories().then((cats) => {
      setCategories(cats);
      setCategoryId((current) => current || cats[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    api.adminProducts().then((products) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      setName(product.name);
      setDescription(product.description);
      setImageUrl(product.imageUrl);
      setPriceTRY(String(product.priceKurus / 100));
      setCategoryId(product.categoryId);
      setFulfillmentType(product.fulfillmentType);
      setStock(String(product.stock ?? 0));
      setLeadTimeDays(String(product.leadTimeDays ?? 14));
      setActive(product.active);
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const data: AdminProductInput = {
      name,
      description,
      imageUrl,
      priceTRY: Number(priceTRY),
      categoryId,
      fulfillmentType,
      active,
      ...(fulfillmentType === "STOCKED" ? { stock: Number(stock) } : { leadTimeDays: Number(leadTimeDays) }),
    };

    try {
      if (isEditing && id) {
        await api.adminUpdateProduct(id, data);
      } else {
        await api.adminCreateProduct(data);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save product.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="page-loading">Loading…</p>;

  return (
    <div>
      <h2>{isEditing ? "Edit product" : "New product"}</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <label>
          Image URL
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        </label>
        <label>
          Price (TRY)
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceTRY}
            onChange={(e) => setPriceTRY(e.target.value)}
            required
          />
        </label>
        <label>
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fulfillment
          <select
            value={fulfillmentType}
            onChange={(e) => setFulfillmentType(e.target.value as FulfillmentType)}
          >
            <option value="STOCKED">Stocked locally in Türkiye</option>
            <option value="ON_REQUEST">Imported from Kenya per order</option>
          </select>
        </label>
        {fulfillmentType === "STOCKED" ? (
          <label>
            Stock
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          </label>
        ) : (
          <label>
            Lead time (days)
            <input
              type="number"
              min="1"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
            />
          </label>
        )}
        <label className="checkbox-label">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Visible in the shop
        </label>

        {error && <p className="field-error">{error}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="button-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}
