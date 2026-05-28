"use client";

import { useRef, useState } from "react";

type Props = {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    floor: number | null;
    phone: string | null;
    bio: string | null;
    avatarUrl: string | null;
    hasPassword: boolean;
    senior: boolean;
  };
};

export default function ProfileForm({ user }: Props) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [floor, setFloor] = useState(user.floor?.toString() || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  const [senior, setSenior] = useState(user.senior);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function saveProfile() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          floor: floor ? parseInt(floor, 10) : null,
          phone,
          bio,
          senior,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Profil mis a jour" });
      } else {
        setMessage({ type: "error", text: data.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde" });
    }
    setSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }
    setPassSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Mot de passe modifie" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors du changement" });
    }
    setPassSaving(false);
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        setMessage({ type: "success", text: "Photo mise a jour" });
      } else {
        setMessage({ type: "error", text: data.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors du telechargement" });
    }
    setUploading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9375rem",
            background: message.type === "success" ? "#e8f5e9" : "#fce4ec",
            color: message.type === "success" ? "#2e7d32" : "#c62828",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Avatar */}
      <section>
        <h3 style={{ marginBottom: 16, fontSize: "1.0625rem" }}>Photo de profil</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--color-border)",
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span>{user.firstName[0]}{user.lastName[0]}</span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={uploadAvatar}
            />
            <button
              className="btn btn-outline"
              style={{ fontSize: "0.875rem" }}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Telechargement..." : "Changer la photo"}
            </button>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginTop: 6 }}>
              JPG, PNG ou WebP. 5 Mo max.
            </p>
          </div>
        </div>
      </section>

      {/* Info */}
      <section>
        <h3 style={{ marginBottom: 16, fontSize: "1.0625rem" }}>Informations</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Prenom
              </label>
              <input
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Nom
              </label>
              <input
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Email
            </label>
            <input
              className="input"
              value={user.email}
              disabled
              style={{ width: "100%", opacity: 0.6 }}
            />
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginTop: 4 }}>
              L email ne peut pas etre modifie.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Etage
              </label>
              <input
                className="input"
                type="number"
                min={1}
                max={19}
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Telephone
              </label>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 XX XX XX XX"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Bio / Centres d interet
            </label>
            <textarea
              className="input"
              value={bio}
              onChange={(e) => { const v = e.target.value; if (v.length <= 1000) setBio(v); }}
              placeholder="Parlez de vous, de vos hobbies, de ce que vous pouvez partager avec vos voisins..."
              rows={4}
              maxLength={1000}
              style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: 4, textAlign: "right" }}>
              {bio.length}/1000
            </p>
          </div>

          <div style={{ marginTop: 8, padding: "16px 20px", background: senior ? "var(--color-warning-light)" : "var(--color-bg-alt)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <button
                type="button"
                onClick={() => setSenior(!senior)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: senior ? "var(--color-primary)" : "var(--color-border)",
                  position: "relative", transition: "background 0.2s", flexShrink: 0, marginTop: 2,
                }}
              >
                <span style={{
                  position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  left: senior ? 22 : 2,
                }} />
              </button>
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 4 }}>Senior</p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  En tant que senior, je souhaiterais mentionner cette information sur mon profil public pour favoriser des interactions adaptées et conviviales au sein de la résidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </section>

      {/* Password */}
      {user.hasPassword && (
        <section>
          <h3 style={{ marginBottom: 16, fontSize: "1.0625rem" }}>Mot de passe</h3>
          <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Mot de passe actuel
              </label>
              <input
                className="input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                  Nouveau mot de passe
                </label>
                <input
                  className="input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label className="label" style={{ display: "block", marginBottom: 4, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                  Confirmer
                </label>
                <input
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div>
              <button className="btn btn-outline" type="submit" disabled={passSaving}>
                {passSaving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Google account info */}
      {user.email && !user.hasPassword && (
        <section>
          <h3 style={{ marginBottom: 8, fontSize: "1.0625rem" }}>Connexion</h3>
          <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>
            Vous utilisez la connexion Google ({user.email}). Vous ne pouvez pas modifier votre mot de passe ici.
          </p>
        </section>
      )}
    </div>
  );
}
