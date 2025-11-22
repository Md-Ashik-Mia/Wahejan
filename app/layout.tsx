// import "@/styles/globals.css";

// export const metadata = {
//   title: "Wahejan",
//   description: "Role-based dashboard",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }
import "@/styles/globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Wahejan",
  description: "Role-based dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
