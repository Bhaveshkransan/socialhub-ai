import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./Signup.css";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const dispatch = useDispatch()

  const changeEventHandler = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
     

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/v1/user/login",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user))
        
        toast.success(res.data.message);

        setLoginSuccess(true);

        setInput({
          email: "",
          password: "",
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-card" onSubmit={loginHandler}>
        <div className="m-4">
          <div className="flex justify-center mb-6">
            <img src="/chatimage.png" alt="SocialHub" className="h-16 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; document.getElementById('fallback-logo-login').style.display = 'block'; }} />
            <h1 id="fallback-logo-login" className="signup-logo m-0" style={{ display: 'none' }}>LOGO</h1>
          </div>

          <p className="signup-subtitle">
            {loginSuccess
              ? "Welcome Back! We're happy to see you again."
              : "Login to continue and connect with your friends."}
          </p>

          <div>
            <span className="signup-label">Email</span>

            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="signup-input"
              required
            />
          </div>

          <div>
            <span className="signup-label">Password</span>

            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="signup-input"
              required
            />
          </div>

          {loading ? (
            <Button className="w-full mt-4" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </Button>
          ) : (
            <Button type="submit" className="w-full mt-4">
              Login
            </Button>
          )}

          <p className="text-center mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 hover:underline font-medium"
            >
              Signup
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;