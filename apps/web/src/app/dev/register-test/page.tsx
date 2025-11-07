"use client";
import React, { useState } from "react";

type RegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export default function RegisterTestPage() {
  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          username: form.username || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Error desconocido");
      } else {
        setResult(json);
      }
    } catch (err: any) {
      setError(err?.message || "Fallo de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Prueba de Registro (localhost)</h1>
      <p style={{ color: "#555" }}>
        Envia un POST a <code>/api/auth/register</code> desde esta página.
      </p>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="tu@email.com"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="mínimo 6 caracteres"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Nombre (opcional)
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            placeholder="Tu nombre"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Apellido (opcional)
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            placeholder="Tu apellido"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Usuario (opcional)
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="username"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 16px", fontWeight: 600 }}
        >
          {loading ? "Enviando..." : "Registrar"}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, color: "#b00020" }}>Error: {error}</div>
      )}
      {result && (
        <pre style={{ marginTop: 16, background: "#f6f8fa", padding: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}