"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-[var(--sidebar-w)] right-0 h-[var(--header-h)] z-40 bg-[#212121] flex items-center justify-end  px-6 gap-2.5">
     <span className="text-[14px]">Mr Mosabbir</span>
     <Image src="/profilepicture.svg" width={44} height={44} alt="profilePicture" ></Image>
    </header>
  );
}
