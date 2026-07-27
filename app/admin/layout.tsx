// Admin area has its own minimal layout — no public Navbar or Cart
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
