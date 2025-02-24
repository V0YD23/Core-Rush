"use client"
export default function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Ground Decoration */}
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-400 to-blue-500 text-white relative overflow-hidden">
        {/* Enhanced Cloud Background */}
        <div className="absolute inset-0 z-0">
          {/* Large Slow-Moving Clouds */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute"
              style={{
                left: `${-20 + i * 25}%`,
                top: `${10 + (i % 3) * 20}%`,
                animation: `moveCloud ${
                  20 + Math.random() * 15
                }s linear infinite`,
                animationDelay: `${i * 2}s`,
                opacity: 0.8,
                zIndex: 1,
              }}
            >
              <div className="cloud-large relative">
                <div className="w-32 h-12 bg-white rounded-full blur-md" />
                <div className="w-16 h-16 bg-white rounded-full blur-md absolute -top-6 -left-4" />
                <div className="w-16 h-16 bg-white rounded-full blur-md absolute -top-4 left-8" />
                <div className="w-16 h-16 bg-white rounded-full blur-md absolute -top-6 left-20" />
              </div>
            </div>
          ))}

          {/* Medium Clouds */}
          {[...Array(10)].map((_, i) => (
            <div
              key={`medium-${i}`}
              className="absolute"
              style={{
                right: `${-15 + i * 20}%`,
                top: `${30 + (i % 4) * 15}%`,
                animation: `moveCloudReverse ${
                  15 + Math.random() * 10
                }s linear infinite`,
                animationDelay: `${i * 1.5}s`,
                opacity: 0.7,
                zIndex: 1,
              }}
            >
              <div className="cloud-medium relative">
                <div className="w-24 h-10 bg-white rounded-full blur-md" />
                <div className="w-12 h-12 bg-white rounded-full blur-md absolute -top-4 -left-2" />
                <div className="w-12 h-12 bg-white rounded-full blur-md absolute -top-2 left-6" />
                <div className="w-12 h-12 bg-white rounded-full blur-md absolute -top-4 left-14" />
              </div>
            </div>
          ))}

          {/* Small Floating Clouds */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`small-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animation: `float ${
                  8 + Math.random() * 7
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
                zIndex: 0,
              }}
            >
              <div className="w-16 h-6 bg-white rounded-full blur-md opacity-50" />
            </div>
          ))}

          {/* Distant Tiny Clouds */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`tiny-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 40}%`,
                animation: `drift ${25 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: 0.4,
                zIndex: 0,
              }}
            >
              <div className="w-8 h-4 bg-white rounded-full blur-sm" />
            </div>
          ))}
        </div>
        <div className="relative z-10">
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <main className="w-full max-w-4xl">{children}</main>
          </div>
        </div>
      </div>
      <style jsx>{`
    @keyframes moveCloud {
      0% { transform: translateX(-100px); }
      100% { transform: translateX(calc(100vw + 150px)); }
    }
    
    @keyframes moveCloudReverse {
      0% { transform: translateX(calc(100vw + 150px)); }
      100% { transform: translateX(-150px); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.1); }
    }
    
    @keyframes drift {
      0% { transform: translateX(-50px); }
      100% { transform: translateX(calc(100vw + 100px)); }
    }
    
    .cloud-large:hover, .cloud-medium:hover {
      filter: brightness(1.1);
      transition: filter 0.5s ease;
    }
  `}</style>
    </>
  );
}
