import { useState } from "react";
import "./Sign_up.css";
import { Link, useNavigate  } from "react-router-dom";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
  country: "",
  registrationNumber: "",
};

function Sign_Up() {
  const [form, setForm] = useState(initialForm);
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
      // 1. Register the Company in MongoDB (Status will be PENDING)
      const companyRes = await fetch("http://localhost:4000/api/v1/companies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.companyName,
          registrationNo: form.registrationNumber,
          country: form.country,
        }),
      });

      const companyData = await companyRes.json();

      if (!companyRes.ok) {
        throw new Error(companyData.message || "Failed to register company.");
      }

      // Grab the new company's ID from the database
      const newCompanyId = companyData.company._id;

      // 2. Register the Company Manager linked to that Company ID
      const managerRes = await fetch("http://localhost:4000/api/v1/company-managers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          companyId: newCompanyId,
        }),
      });

      const managerData = await managerRes.json();

      if (!managerRes.ok) {
        throw new Error(managerData.message || "Failed to register manager.");
      }

      // 3. Inform user about the pending Fleet Admin authorization
      alert("Registration submitted! Your company is waiting for Fleet Administrator approval.");
      navigate("/login");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup">
      {/* Step 1: image */}
      <div
        className="signup__image"
        style={{ backgroundImage: "url(sign_up/signup_left.jpg)" }}
        role="img"
        aria-label="Container ship at sea under an evening sky"
      />

      <section className="signup__panel">
        <form className="signup__form" onSubmit={handleSubmit}>
          {/* Step 2: title + description */}
          <div className="signup__group signup__group--intro">
            <h1 className="signup__title">Create Your Account</h1>
            <p className="signup__intro">
              Please provide details of yourself and your fleet. Once you create
              the account, you will get notification of confirmation of your
              registration. Thanks!
            </p>
          </div>

          {/* Step 3: first name to password */}
          <div className="signup__group signup__group--personal">
            <div className="signup__row">
              <div className="signup__field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="signup__field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="signup__field">
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

            <div className="signup__field">
              <label htmlFor="password">Password (9-15 characters)</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={9}
                maxLength={15}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Step 4: company name to registration number */}
          <div className="signup__group signup__group--company">
            <div className="signup__field">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup__field signup__field--short">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
              >
                <option value="" disabled></option>
                {/* TODO: replace with full country list */}
                <option value="BD">Bangladesh</option>
                <option value="IN">India</option>
                <option value="SG">Singapore</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
              </select>
            </div>

            <div className="signup__field">
              <label htmlFor="registrationNumber">Registration Number</label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                value={form.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Step 5: login link + button */}
          <div className="signup__group signup__group--footer">
            <div className="signup__footer">
              <p className="signup__login">
                Already have an account? <Link to="/login">Log In</Link>
              </p>
              {error && <p style={{ color: "red", width: "100%", margin: "0.5rem 0", fontWeight: "bold" }}>{error}</p>}
              <button type="submit" className="signup__button" disabled={loading}>
                {loading ? "REGISTERING..." : "SIGN UP"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Sign_Up;