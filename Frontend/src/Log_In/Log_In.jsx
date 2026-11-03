import { useState } from "react";
import { Link } from "react-router-dom";
import "./Log_in.css";

function Log_In() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend login API (2FA email check goes here later)
    console.log("Log in data:", form);
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

        <button type="submit" className="login__button">
          Sign In
        </button>

        <p className="login__signup">
          New here? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}

export default Log_In;