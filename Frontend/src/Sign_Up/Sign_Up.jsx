import { useState } from "react";
import "./Sign_up.css";
import { Link } from "react-router-dom";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend sign up API
    console.log("Sign up data:", form);
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
                Already have an account. <Link to="/login">Log In</Link>
              </p>
              <button type="submit" className="signup__button">
                SIGN UP
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Sign_Up;