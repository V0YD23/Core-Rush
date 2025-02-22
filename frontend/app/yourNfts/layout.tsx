export default function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-400 to-blue-500 text-white relative">
        {/* Cloud Background */}
        <div className="absolute inset-0 z-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${8 + Math.random() * 10}s infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              <div className="w-16 h-16 bg-white rounded-full blur-md opacity-80" />
            </div>
          ))}
        </div>
        <div className="relative z-10">
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-4xl">{children}</main>
    </div>
    </div>
    </div>

  );
}
