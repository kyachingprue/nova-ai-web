"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ImagePlus, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutPath, parsePlan } from "@/lib/plans";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});
const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;

const requirements = [
  { label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { label: "One uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { label: "One lowercase letter", test: (password: string) => /[a-z]/.test(password) },
  { label: "One number or symbol", test: (password: string) => /[\d\W]/.test(password) },
];

export default function AuthCard({ mode, plan }: { mode: "login" | "register"; plan?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const password = isRegister ? registerForm.watch("password") || "" : "";
  const selectedPlan = parsePlan(plan);

  async function onSubmit(values: RegisterValues | LoginValues) {
    setBusy(true);
    try {
      if (isRegister) {
        let imageUrl = "";
        if (image) {
          const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
          if (!imgbbKey) throw new Error("Image uploads are not configured.");
          const formData = new FormData();
          formData.append("image", image);
          const upload = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`, {
            method: "POST",
            body: formData,
          });
          const uploaded = await upload.json();
          if (!upload.ok || !uploaded.success || typeof uploaded.data?.url !== "string") {
            throw new Error("Profile image upload failed. Please try another image.");
          }
          imageUrl = uploaded.data.url;
        }
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, imageUrl }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not create your account.");
        toast.success("Verification code sent to your email.");
        const verificationParams = new URLSearchParams({ email: result.email });
        if (selectedPlan) verificationParams.set("plan", selectedPlan);
        router.push(`/verify?${verificationParams.toString()}`);
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Sign-in failed.");
        toast.success("Welcome back!");
        router.push(selectedPlan ? checkoutPath(selectedPlan) : "/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Choose an image smaller than 5 MB.");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <section className="auth-card">
      <Link href="/" className="auth-brand"><BrandMark />Nova AI</Link>
      <div className="mb-7 mt-9">
        <p className="eyebrow">{isRegister ? "YOUR NEXT IDEA STARTS HERE" : "WELCOME BACK"}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{isRegister ? "Create your account" : "Sign in to Nova"}</h1>
        <p className="mt-2 text-sm text-mist">{isRegister ? "Start exploring with your personal AI workspace." : "Your ideas and conversations are right where you left them."}</p>
      </div>

      <GoogleSignInButton plan={selectedPlan} />
      <div className="auth-divider"><span />or continue with email<span /></div>

      {isRegister ? (
        <form className="space-y-4" onSubmit={registerForm.handleSubmit(onSubmit as (values: RegisterValues) => void)}>
          <div className="grid grid-cols-2 gap-3">
            <label className="field-label">First name<Input placeholder="Alex" autoComplete="given-name" {...registerForm.register("firstName")} />{registerForm.formState.errors.firstName && <span className="field-error">{registerForm.formState.errors.firstName.message}</span>}</label>
            <label className="field-label">Last name<Input placeholder="Morgan" autoComplete="family-name" {...registerForm.register("lastName")} />{registerForm.formState.errors.lastName && <span className="field-error">{registerForm.formState.errors.lastName.message}</span>}</label>
          </div>
          <label className="field-label">Email address<Input type="email" placeholder="you@example.com" autoComplete="email" {...registerForm.register("email")} />{registerForm.formState.errors.email && <span className="field-error">{registerForm.formState.errors.email.message}</span>}</label>
          <label className="field-label">Password
            <span className="relative block"><Input className="pr-11" type={showPassword ? "text" : "password"} placeholder="Create a strong password" autoComplete="new-password" {...registerForm.register("password")} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="password-eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
          </label>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 -mt-2">
            {requirements.map((item) => <span key={item.label} className={`password-rule ${item.test(password) ? "met" : ""}`}>{item.test(password) ? "✓" : "○"} {item.label}</span>)}
          </div>
          <div>
            <span className="field-label">Profile image <span className="font-normal text-mist">(optional)</span></span>
            <label className="upload-box">
              {imagePreview ? <img src={imagePreview} alt="Profile preview" className="h-11 w-11 rounded-full object-cover" /> : <span className="upload-icon"><ImagePlus size={19} /></span>}
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{image?.name || "Choose an image to upload"}</span><span className="mt-0.5 block text-xs text-mist">PNG, JPG or WEBP · max 5 MB</span></span>
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => chooseImage(event.target.files?.[0])} />
            </label>
          </div>
          <Button className="w-full bg-gradient-to-r from-[#7968f5] to-[#a34de4]" size="lg" type="submit" disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" size={17} /> : null}Create account
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={loginForm.handleSubmit(onSubmit as (values: LoginValues) => void)}>
          <label className="field-label">Email address<Input type="email" placeholder="you@example.com" autoComplete="email" {...loginForm.register("email")} />{loginForm.formState.errors.email && <span className="field-error">{loginForm.formState.errors.email.message}</span>}</label>
          <label className="field-label">Password
            <span className="relative block"><Input className="pr-11" type={showPassword ? "text" : "password"} placeholder="Your password" autoComplete="current-password" {...loginForm.register("password")} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="password-eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
            {loginForm.formState.errors.password && <span className="field-error">{loginForm.formState.errors.password.message}</span>}
          </label>
          <Button className="w-full" size="lg" type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={17} /> : null}Sign in</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-mist">{isRegister ? "Already have an account?" : "New to Nova AI?"} <Link className="font-semibold text-nova hover:underline" href={isRegister ? `/login${plan ? `?plan=${encodeURIComponent(plan)}` : ""}` : `/register${plan ? `?plan=${encodeURIComponent(plan)}` : ""}`}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
      <p className="mt-5 text-center text-xs leading-relaxed text-mist">By continuing, you agree to our <a className="underline underline-offset-2" href="/terms">Terms</a> and <a className="underline underline-offset-2" href="/privacy">Privacy Policy</a>.</p>
    </section>
  );
}
