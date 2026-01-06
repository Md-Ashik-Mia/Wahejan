
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn, getSession } from "next-auth/react";
// import Image from "next/image";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();

//   async function handleLogin(e: React.FormEvent) {
//     e.preventDefault();

//     const res = await signIn("credentials", {
//       redirect: false,
//       email,
//       password,
//     });

//     if (res?.error) {
//       alert("Invalid email or password");
//       return;
//     }

//     const session = await getSession();
//     const role = (session?.user as any)?.role;
//     const hasPlan = (session?.user as any)?.hasPlan;

//     if (role === "admin") {
//       router.push("/admin/dashboard");
//     } else if (role === "user" && hasPlan) {
//       router.push("/user/dashboard");
//     } else if (role === "user" && !hasPlan) {
//       router.push("/user/dashboard ");
//     } else {
//       router.push("/");
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
//       <h1 className="text-2xl font-bold mb-6">Welcome Back!</h1>

//       <form onSubmit={handleLogin} className="w-[350px] space-y-3">
//         <input
//           type="email"
//           placeholder="Enter your email"
//           className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Enter your password"
//           className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button
//           type="submit"
//           className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold"
//         >
//           Log in
//         </button>

//         <div className="flex items-center justify-center gap-4 pt-4">
//           <button
//             type="button"
//             onClick={() => signIn("google")}
//             className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full"
//           >
//             <Image src="/google.svg" alt="Google" width={18} height={18} />
//             Login with Google
//           </button>

//           <button
//             type="button"
//             onClick={() => signIn("apple")}
//             className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full"
//           >
//             <Image src="/apple.svg" alt="Apple" width={18} height={18} />
//             Login with Apple
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }













// app/(public)/login/page.tsx
"use client";

import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";

type ClientSession = {
  user?: {
    role?: string;
    hasPlan?: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
} | null;

async function waitForSessionReady(maxMs = 2000, intervalMs = 100): Promise<ClientSession> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const session = (await getSession()) as ClientSession;
    const role = session?.user?.role;
    const accessToken = session?.accessToken;
    if (role && accessToken) return session;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return (await getSession()) as ClientSession;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const applySessionAndRedirect = (session: ClientSession) => {
    const role = session?.user?.role?.trim().toLowerCase();
    const hasPlan = session?.user?.hasPlan;

    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;

    if (accessToken) localStorage.setItem("access_token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }
    if (role === "user") {
      router.replace("/user/dashboard");
      return;
    }

    // If we got here, the session is not usable for routing.
    // Avoid redirect loops (common when NEXTAUTH_SECRET/NEXTAUTH_URL are misconfigured in prod).
    throw new Error("SESSION_NOT_READY");
  };

  // If user comes back here after Google OAuth, session already exists.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await waitForSessionReady();
      if (cancelled) return;
      if (session?.user?.role && session?.accessToken) {
        applySessionAndRedirect(session);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildClientInfo = () => {
    if (typeof window === "undefined") return null;

    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
    };

    return info;
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (isLoggingIn) return;
    setIsLoggingIn(true);

    const clientInfo = buildClientInfo();
    if (clientInfo) {
      localStorage.setItem("client_info", JSON.stringify(clientInfo));
    }

    try {
      const res = await signIn("credentials", {
        redirect: false, // we handle redirect manually
        email,
        password,
        client_info: clientInfo ? JSON.stringify(clientInfo) : "",
      });

      if (res?.error) {
        alert(
          "Login failed. If this only happens on Vercel, check that NEXTAUTH_URL is your deployed https URL and NEXTAUTH_SECRET is set (no quotes). If your backend is an ngrok URL, make sure it is still active and reachable from Vercel."
        );
        setIsLoggingIn(false);
        return;
      }

      // 🔐 Wait for session to be ready (role + accessToken)
      const session = await waitForSessionReady();
      const role = session?.user?.role;
      const accessToken = session?.accessToken;

      if (!role || !accessToken) {
        alert(
          "Login succeeded but session is missing (role/access token). On Vercel this usually means NEXTAUTH_SECRET or NEXTAUTH_URL is not set correctly. Check Vercel → Project → Settings → Environment Variables."
        );
        setIsLoggingIn(false);
        return;
      }

      applySessionAndRedirect(session);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message === "SESSION_NOT_READY") {
        alert(
          "Login session was not ready for routing. Please re-try after fixing NEXTAUTH_SECRET/NEXTAUTH_URL on Vercel."
        );
      } else {
        alert("Login failed. Please try again.");
      }
      setIsLoggingIn(false);
    }
  }



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Welcome Back!</h1>

      <form onSubmit={handleLogin} className="w-[350px] space-y-3">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          disabled={isLoggingIn}
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          disabled={isLoggingIn}
        />
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoggingIn ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          ) : null}
          {isLoggingIn ? "Logging in…" : "Log in"}
        </button>

        <p className="text-center text-sm text-white/80">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4 hover:text-white">
            Sign up
          </Link>
        </p>

        <button
          type="button"
          disabled={isLoggingIn}
          onClick={() => {
            if (isLoggingIn) return;
            setIsLoggingIn(true);
            void signIn("google", { callbackUrl: "/login" });
          }}
          className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <FaGoogle className="text-lg" aria-hidden="true" />
          Login with Google
        </button>
      </form>
    </div>
  );
}
