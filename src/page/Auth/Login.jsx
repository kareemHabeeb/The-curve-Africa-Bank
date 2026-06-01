import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { FaRegEye, FaRegEyeSlash, FaUser, FaLock, FaSpinner } from "react-icons/fa";
// import { useContext } from "react";
// import { AuthContext } from "../../context/AuthContext.jsx";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAccessToken, setRefreshToken, setUser } from "../../redux/apiSlice";
import axios from "axios";
import Swal from 'sweetalert2'



const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  // const loginUser = (email, password) => {
  //   dispatch(logIn({ email, password }));
  //   navigate("/dashboard");
  // }

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Login successful",
      showConfirmButton: false,
      timer: 1500
    });
    const responsData = response.data;
    console.log("responsData",responsData.user);
    dispatch(setAccessToken(responsData?.accessToken));
    dispatch(setRefreshToken(responsData?.refreshToken));
    dispatch(setUser(responsData?.user));
    
      navigate("/dashboard");
    }catch(error){
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response.data.message,
      });
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="login_container">
      <div className="login_card">
        <div className="login_header">
          <h1>Bank Login</h1>
          <p>Secure access to your account</p>
        </div>

        <form className="login_form" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="form_group">
            <label htmlFor="email">Email Address</label>
            <div className="input_wrapper">
              <FaUser className="input_icon" />
              <input type="email" id="email" value={email} placeholder="Enter your email" required={true} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          {/* Password Input */}
          <div className="form_group">
            <label htmlFor="password">Password</label>
            <div className="input_wrapper password_wrapper">
              <FaLock className="input_icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                id="password"
                placeholder="Enter your password"
                required={true}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle_password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="remember_forgot">
            <label className="remember_me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot_link">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button type="submit" className="login_btn" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="signup_link">
          <p>
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
