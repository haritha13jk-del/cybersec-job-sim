import { authAPI } from "../services/api";

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await authAPI.login({
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", res.data);

    // ✅ SAFE TOKEN EXTRACTION (MOST IMPORTANT FIX)
    const token =
      res.data?.token ||
      res.data?.data?.token ||
      res.data?.accessToken;

    if (!token) {
      alert("Login failed: No token received");
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", token);

    // OPTIONAL: store user too (safe fallback)
    if (res.data?.user) {
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    // ✅ Redirect to dashboard
    window.location.href = "/";

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    alert("Server error or invalid credentials");
  }
};