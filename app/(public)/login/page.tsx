
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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false, // we handle redirect manually
      email,
      password,
    });

    if (res?.error) {
      alert("Invalid email or password");
      return;
    }

    // 🔐 Get session from NextAuth
    const session = await getSession();
    const role = (session?.user as any)?.role;
    const hasPlan = (session?.user as any)?.hasPlan;

    // 🔑 Save accessToken to localStorage for axios interceptors
    const accessToken = (session as any)?.accessToken;
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    // 🔀 Redirect logic (plan page later)
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "user" && hasPlan) {
      router.push("/user/dashboard");
    } else if (role === "user" && !hasPlan) {
      router.push("/user/dashboard");
    } else {
      router.push("/");
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
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button
          type="submit"
          className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold"
        >
          Log in
        </button>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full"
          >
            <Image src="/google.svg" alt="Google" width={18} height={18} />
            Login with Google
          </button>

          <button
            type="button"
            onClick={() => signIn("apple")}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full"
          >
            <Image src="/apple.svg" alt="Apple" width={18} height={18} />
            Login with Apple
          </button>
        </div>
      </form>
    </div>
  );
}
