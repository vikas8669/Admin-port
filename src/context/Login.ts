// src/context/Login.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/api/api";
import { apiUrl } from "@/api/apiEndPoints";

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await API.post(apiUrl.login, {
        email: data.email,
        password: data.password,
      });
      return response.data; // { success, message, data: userObj, token }
    },
    onSuccess: (res, variables) => {
      console.log("Login success response:", res);

      if (!res.success || !res.data || !res.token) {
        return toast.error("Invalid login response");
      }

      // Store token and user correctly
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res?.data));
      localStorage.setItem("isAuth", "true");

      if (variables.rememberMe) localStorage.setItem("rememberMe", "true");

      toast.success("Login successful 🎉");

      // Redirect to admin dashboard
      navigate("/admin", { replace: true });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await API.post(apiUrl.logout); // optional
    } catch (error) {
      console.log(error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuth");

    toast.success("Logged out successfully!");

    navigate("/login", { replace: true });
  };

  return logout;
};