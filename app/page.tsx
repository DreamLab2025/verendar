export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
        Verendar
      </span>
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
        Quan ly xe ca nhan, nhac bao duong va dieu huong garage tren ban do
      </h1>
      <p className="max-w-2xl text-muted-foreground">
        Boilerplate da duoc scaffold theo rule project. Ban co the bat dau tu cac route groups:
        auth, user, vehicle, notifications, admin.
      </p>
      <div className="text-sm text-muted-foreground">Bat dau tai: /login hoac /vehicle/list</div>
    </main>
  );
}
