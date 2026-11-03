import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Log_in.css";

function Log_In() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/v1/company-managers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Save user session in localStorage
      localStorage.setItem("user", JSON.stringify(data.manager));
      localStorage.setItem("company", JSON.stringify(data.company));

      // Handle Admin Authorization Status:
      if (data.company.status === "PENDING") {
        alert("Your company is waiting for approval by the Fleet Administrator. You cannot access fleet features yet.");
      } else if (data.company.status === "APPROVED") {
        alert("Login successful! Welcome back.");
        // Redirect to your dashboard or home page
        // navigate("/home");
      } else if (data.company.status === "REJECTED") {
        alert("Your company registration was rejected.");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <img
        className="login__logo"
        src="/Login/logo_ww.png"
        alt="Ocean Bridge"
      />

      <form className="login__card" onSubmit={handleSubmit}>
        <h1 className="login__title">Log In</h1>

        <p className="login__note">
          If 2FA is enabled, prompt the user to verify their identity via email
          before login. Otherwise, log them in directly.
        </p>

        <div className="login__field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="login__field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "1rem", fontWeight: "bold" }}>{error}</p>}
        <button type="submit" className="login__button" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="login__signup">
          New here? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}

export default Log_In;