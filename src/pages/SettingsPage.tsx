import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Account settings: your display name, and the delivery address checkout
// prefills from (see CheckoutPage — "Save this as my default delivery
// address" writes back here). Two independent forms/saves on purpose, so
// fixing a typo in your name doesn't require re-entering your address and
// vice versa.
export function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressStatus, setAddressStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressFieldErrors, setAddressFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    api
      .defaultAddress()
      .then((addr) => {
        if (!addr) return;
        setFullName(addr.fullName);
        setPhone(addr.phone);
        setCity(addr.city);
        setAddressLine(addr.addressLine);
        setPostalCode(addr.postalCode);
      })
      .catch(() => {})
      .finally(() => setAddressLoading(false));
  }, []);

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault();
    setNameStatus("saving");
    setNameError(null);
    try {
      await api.updateProfile({ name });
      await refreshUser();
      setNameStatus("saved");
      setTimeout(() => setNameStatus("idle"), 2000);
    } catch (err) {
      setNameStatus("error");
      setNameError(err instanceof ApiError ? err.message : "Couldn't save your name.");
    }
  }

  async function handleAddressSubmit(e: FormEvent) {
    e.preventDefault();
    setAddressStatus("saving");
    setAddressError(null);
    setAddressFieldErrors({});
    try {
      await api.saveDefaultAddress({ fullName, phone, city, addressLine, postalCode });
      setAddressStatus("saved");
      setTimeout(() => setAddressStatus("idle"), 2000);
    } catch (err) {
      setAddressStatus("error");
      if (err instanceof ApiError) {
        setAddressError(err.message);
        setAddressFieldErrors(err.fields ?? {});
      } else {
        setAddressError("Couldn't save your address.");
      }
    }
  }

  return (
    <div className="page settings-page">
      <h1>Settings</h1>
      <p className="settings-intro">Manage your account details and your default delivery address.</p>

      <section className="settings-section">
        <h2>Your details</h2>
        <form onSubmit={handleNameSubmit} className="settings-form">
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </label>
          <label>
            Email
            <input value={user?.email ?? ""} disabled />
            <span className="settings-field-hint">
              Your email is tied to sign-in and can't be changed here — contact us if you need it updated.
            </span>
          </label>
          {nameError && <p className="field-error">{nameError}</p>}
          <button type="submit" className="button-primary" disabled={nameStatus === "saving"}>
            {nameStatus === "saving" ? "Saving…" : nameStatus === "saved" ? "Saved ✓" : "Save name"}
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h2>Default delivery address</h2>
        <p className="settings-section-hint">
          Saved here once, this fills in automatically at checkout — no more retyping it on every order. You
          can still edit it for a one-off delivery at checkout without changing what's saved here.
        </p>
        {addressLoading ? (
          <p className="page-loading">Loading…</p>
        ) : (
          <form onSubmit={handleAddressSubmit} className="settings-form">
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              {addressFieldErrors.fullName && <span className="field-error">{addressFieldErrors.fullName[0]}</span>}
            </label>
            <label>
              Phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                required
              />
              {addressFieldErrors.phone && <span className="field-error">{addressFieldErrors.phone[0]}</span>}
            </label>
            <label>
              City
              <input value={city} onChange={(e) => setCity(e.target.value)} required />
              {addressFieldErrors.city && <span className="field-error">{addressFieldErrors.city[0]}</span>}
            </label>
            <label>
              Address
              <textarea value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
              {addressFieldErrors.addressLine && (
                <span className="field-error">{addressFieldErrors.addressLine[0]}</span>
              )}
            </label>
            <label>
              Postal code
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
              {addressFieldErrors.postalCode && (
                <span className="field-error">{addressFieldErrors.postalCode[0]}</span>
              )}
            </label>
            {addressError && <p className="field-error">{addressError}</p>}
            <button type="submit" className="button-primary" disabled={addressStatus === "saving"}>
              {addressStatus === "saving" ? "Saving…" : addressStatus === "saved" ? "Saved ✓" : "Save address"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
