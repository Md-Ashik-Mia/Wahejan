// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState<"user" | "admin">("user");
//   const router = useRouter();

//   const submit = async () => {
//     // demo auth: set a cookie
//     document.cookie = `role=${role}; path=/`;
//     router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
//   };

//   return (
//     <div className="min-h-screen grid place-items-center">
//       <div className="w-full max-w-md space-y-3">
//         <h1 className="text-2xl font-semibold text-center">Welcome Back!</h1>
//         <input
//           className="w-full bg-gray-800 px-3 py-2 rounded"
//           placeholder="Enter your email"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//         />
//         <select
//           className="w-full bg-gray-800 px-3 py-2 rounded"
//           value={role}
//           onChange={e => setRole(e.target.value as any)}
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//         </select>
//         <button onClick={submit} className="w-full bg-blue-600 py-2 rounded">Log in</button>
//       </div>
//     </div>
//   );
// }

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
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      alert("Invalid email or password");
      return;
    }

    const session = await getSession();
    const role = (session?.user as any)?.role;
    const hasPlan = (session?.user as any)?.hasPlan;

    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "user" && hasPlan) {
      router.push("/user/dashboard");
    } else if (role === "user" && !hasPlan) {
      router.push("/user/dashboard ");
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
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setPassword(e.target.value)}
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
