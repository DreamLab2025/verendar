import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden w-full flex-col bg-zinc-50 p-10 text-zinc-900 lg:flex">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0">
          <Image
            src="/auth-bg.jpg"
            alt="Authentication background"
            fill
            className="object-cover transition-all"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="relative z-20 flex items-center gap-2 text-lg font-medium">
          <Image width={180} height={180} src="/logo.svg" alt="Verendar Logo" className="h-14" style={{ width: "auto" }} />
        </div>
        {/* <div className="relative z-20 mt-auto max-w-[480px]">
          <blockquote className="space-y-4">
            <p className="text-3xl font-extrabold italic tracking-tight text-primary font-quicksand leading-tight">
              &ldquo;Giải pháp quản lý phương tiện và đặt xe thông minh, hiện đại và an toàn.&rdquo;
            </p>
            <footer className="text-sm font-semibold tracking-wider uppercase text-zinc-500 flex items-center gap-2">
              <span className="h-px w-8 bg-zinc-300" />
              Đội ngũ Verendar
            </footer>
          </blockquote>
        </div> */}
      </div>
      <div className="relative flex w-full flex-col items-center justify-center p-4">
        {/* On mobile show logo */}
        <div className="absolute top-4 left-4 lg:hidden">
          <Image width={56} height={56} src="/icon.svg" alt="Verendar Icon" className="h-14 w-auto aspect-square" style={{ width: "auto" }} />
        </div>
        {children}
      </div>
    </div>
  );
}
