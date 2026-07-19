import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Using Shadcn button
import "./Signup.css";
import axios from "axios";
import { toast } from "sonner"; // Using Shadcn toast
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    console.log(input);
    try {
      setLoading(true);
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        console.log("SUCCESS RESPONSE:", res.data);
        toast.success(res.data.message); // Trigger Shadcn success toast
        setInput({
          username: "",
          email: "",
          password: "",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.log("ERROR RESPONSE:", error);
      toast.error(error.response?.data?.message || "Network Error"); // Trigger Shadcn error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-card" onSubmit={signupHandler}>
        <div className="m-4">
          <div className="flex justify-center mb-6">
            <img src="/chatimage.png" alt="SocialHub" className="h-16 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; document.getElementById('fallback-logo-signup').style.display = 'block'; }} />
            <h1 id="fallback-logo-signup" className="signup-logo m-0" style={{ display: 'none' }}>LOGO</h1>
          </div>
          <p className="signup-subtitle">
            Sign up to see photos and videos for your friends
          </p>
          <div>
            <span className="signup-label">Username </span>
            <Input
              type="text"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
              className="signup-input"
            />
          </div>
          <div>
            <span className="signup-label">Email </span>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="signup-input"
            />
          </div>
          <div>
            <span className="signup-label">Password </span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="signup-input"
            />
          </div>
          {loading ? (
            <Button className="w-full mt-4" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up...
            </Button>
          ) : (
            <Button type="submit" className="w-full mt-4">
            Sign up
          </Button>
          )}

        
          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
