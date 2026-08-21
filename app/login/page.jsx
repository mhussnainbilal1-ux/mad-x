import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Login",
  description: "Sign in to the MADX Sports administration portal.",
};

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
