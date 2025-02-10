export default function ChildLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <main className="w-full max-w-4xl">{children}</main>
      </div>
    );
  }
  