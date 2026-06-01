import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaSpinner,
} from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  const signUpSchema = z
    .object({
      email: z.string().email("Invalid email address"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
          "Password must contain uppercase, lowercase, number, and special character",
        ),
      fullName: z.string().min(2, "Full name must be at least 2 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"], // This specifies where the error message should be shown
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema), // Links Zod to the form
  });

  const submitSignUp = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/auth/signup`, data);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Account created successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  });
  // console.log(userDetails);
  return (
    <div className="login_container">
      <div className="auth_showcase">
        <div className="showcase_content">
          <span className="bank_badge">🏦 SecureBank</span>

          <h1>Digital Banking You Can Trust</h1>

          <p>
            Manage your accounts, transfer money securely, track transactions in
            real time, and enjoy enterprise-grade protection.
          </p>

          <div className="security_cards">
            <div className="security_card">
              <span>🔒</span>
              <div>
                <h4>256-bit Encryption</h4>
                <p>Your data stays protected.</p>
              </div>
            </div>

            <div className="security_card">
              <span>🛡️</span>
              <div>
                <h4>Fraud Monitoring</h4>
                <p>24/7 security checks.</p>
              </div>
            </div>

            <div className="security_card">
              <span>⚡</span>
              <div>
                <h4>Instant Transfers</h4>
                <p>Move money in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="login_card signup_card">
        <div className="login_header">
          <h1>Create Your Account</h1>
          <p>Join our bank and manage your finances</p>
        </div>

        <form className="login_form" onSubmit={submitSignUp}>
          {/* Full Name Input */}
          <div className="form_group">
            <label htmlFor="name">Full Name</label>
            <div className="input_wrapper">
              <FaUser className="input_icon" />
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                {...register("fullName")} // Connects input to react-hook-form
              />
              {errors.fullName && (
                <span className="error_text">{errors.fullName.message}</span>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="form_group">
            <label htmlFor="email">Email Address</label>
            <div className="input_wrapper">
              <FaEnvelope className="input_icon" />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                {...register("email")} // Connects input to react-hook-form
              />
              {errors.email && (
                <span className="error_text">{errors.email.message}</span>
              )}
            </div>
          </div>

          {/* Account Number Input
          <div className="form_group">
            <label htmlFor="accountNumber">Account Number</label>
            <div className="input_wrapper">
              <FaIdCard className="input_icon" />
              <input
                type="text"
                id="accountNumber"
                placeholder="Enter account number"
              />
            </div>
          </div> */}

          {/* Password Input */}
          <div className="form_group">
            <label htmlFor="password">Password</label>
            <div className="input_wrapper password_wrapper">
              <FaLock className="input_icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a strong password"
                {...register("password")} // Connects input to react-hook-form
              />

              <button
                type="button"
                className="toggle_password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            {errors.password && (
              <span className="error_text">{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="form_group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input_wrapper password_wrapper">
              <FaLock className="input_icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                {...register("confirmPassword")} // Connects input to react-hook-form
              />

              <button
                type="button"
                className="toggle_password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error_text">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="form_group">
            <label className="terms_checkbox">
              <input type="checkbox" />
              <span>
                I agree to the{" "}
                <a href="#terms" className="terms_link">
                  Terms and Conditions
                </a>
              </span>
            </label>
          </div>

          {/* Signup Button */}
          <button type="submit" className="login_btn" disabled={loading}>
            {loading ? "please wait..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="signup_link">
          <p>
            Already have an account? <Link to="/">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
