import Link from "next/link";
import Image from "next/image";

const featuredSketches = [
  { id: "butterfly", title: "Butterfly", src: "/sketches/butterfly.svg" },
  { id: "mandala", title: "Mandala", src: "/sketches/mandala.svg" },
  { id: "fox", title: "Fox", src: "/sketches/fox.svg" },
  { id: "lotus", title: "Lotus", src: "/sketches/lotus.svg" },
  { id: "owl", title: "Owl", src: "/sketches/owl.svg" },
  { id: "peacock", title: "Peacock", src: "/sketches/peacock.svg" },
];

const features = [
  {
    icon: "🎨",
    title: "100+ Unique Sketches",
    description: "Curated collection from mandalas to animals, landscapes to abstract patterns",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: "✨",
    title: "Intuitive Controls",
    description: "Tap to fill colors, draw details with brushes, pinch to zoom for precision work",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: "💾",
    title: "Never Lose Progress",
    description: "Your artwork auto-saves locally and syncs to cloud when signed in",
    gradient: "from-tertiary/20 to-tertiary/5",
  },
  {
    icon: "📤",
    title: "Export Anywhere",
    description: "Download your masterpieces as high-quality PNG images to share",
    gradient: "from-primary/20 to-secondary/5",
  },
  {
    icon: "🏆",
    title: "Gamified Progress",
    description: "Earn XP, level up your artist rank, and unlock exclusive achievements",
    gradient: "from-secondary/20 to-tertiary/5",
  },
  {
    icon: "🔄",
    title: "Multi-Device Sync",
    description: "Start on your phone, continue on tablet — your art follows you",
    gradient: "from-tertiary/20 to-primary/5",
  },
];

const testimonials = [
  {
    quote: "The perfect way to unwind after a long day. Love the variety of sketches!",
    author: "Sarah M.",
    role: "Artist & Teacher",
    avatar: "👩‍🎨",
  },
  {
    quote: "My kids and I use this together. It's become our favorite weekend activity.",
    author: "Marcus L.",
    role: "Parent",
    avatar: "👨‍👧",
  },
  {
    quote: "Finally, a coloring app that feels premium and actually saves my progress.",
    author: "Emma K.",
    role: "Designer",
    avatar: "👩‍💻",
  },
];

const stats = [
  { value: "100+", label: "Sketches" },
  { value: "50K+", label: "Artists" },
  { value: "1M+", label: "Artworks Created" },
  { value: "4.9★", label: "User Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-variant/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-lg">🎨</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-headline text-on-background">
                Color<span className="text-primary">Sketch</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 sm:px-6 py-2.5 text-sm font-bold font-headline text-white btn-primary-gradient rounded-xl soft-touch shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-surface to-secondary/5" />
          <div className="absolute top-20 left-[10%] w-64 sm:w-96 h-64 sm:h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-[10%] w-72 sm:w-[500px] h-72 sm:h-[500px] bg-secondary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Loved by 50,000+ artists worldwide</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-headline tracking-tight text-on-background mb-6 leading-[1.1]">
              Your Digital Canvas for{" "}
              <span className="relative">
                <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-tertiary">
                  Mindful Coloring
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-3 sm:h-4 bg-primary/20 -z-0 rounded-full" />
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Escape the noise. Discover 100+ beautiful sketches, from intricate mandalas to serene landscapes.
              Fill them with colors that spark joy.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-bold font-headline text-white btn-primary-gradient rounded-2xl soft-touch shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-0.5 group"
            >
              Start Creating Free
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base sm:text-lg font-bold font-headline text-on-surface bg-surface-container hover:bg-surface-container-high rounded-2xl transition-all border border-surface-variant/30"
            >
              <span className="text-xl">▶</span>
              Watch Demo
            </Link>
          </div>

          {/* Preview Sketches */}
          <div className="relative">
            {/* Sketches Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 max-w-4xl mx-auto">
              {featuredSketches.map((sketch, index) => (
                <div
                  key={sketch.id}
                  className="group relative aspect-square bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    transform: index % 2 === 0 ? 'translateY(8px)' : 'translateY(-8px)'
                  }}
                >
                  <Image
                    src={sketch.src}
                    alt={sketch.title}
                    fill
                    className="object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {sketch.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* "More" indicator */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <span>+94 more sketches waiting for you</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 sm:py-12 px-4 bg-surface-container-low border-y border-surface-variant/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-4xl font-bold font-headline text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-on-surface-variant uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4 sm:mb-6">
              <span className="text-secondary text-sm font-medium">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-on-background mb-4">
              Everything You Need to{" "}
              <span className="text-secondary">Create</span>
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-base sm:text-lg">
              A thoughtfully designed coloring experience for relaxation and creativity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative bg-linear-to-br ${feature.gradient} rounded-3xl p-6 sm:p-8 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-surface-variant/10`}
              >
                <span className="text-4xl sm:text-5xl mb-4 sm:mb-6 block transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-headline text-on-background mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary/10 border border-tertiary/20 mb-4 sm:mb-6">
              <span className="text-tertiary text-sm font-medium">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-on-background mb-4">
              Start Creating in <span className="text-tertiary">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { step: "01", title: "Pick a Sketch", description: "Browse our library of 100+ stunning sketches across categories like mandalas, animals, and more.", icon: "🔍" },
              { step: "02", title: "Color & Create", description: "Tap to fill areas, use brushes for details. Our intuitive tools make creating effortless.", icon: "🖌️" },
              { step: "03", title: "Save & Share", description: "Auto-save your progress, export high-quality images, and share your masterpieces.", icon: "✨" },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-primary/30 to-transparent" />
                )}

                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-surface shadow-lg mb-6 text-4xl sm:text-5xl">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-widest">STEP {item.step}</div>
                <h3 className="text-xl sm:text-2xl font-bold font-headline text-on-background mb-3">
                  {item.title}
                </h3>
                <p className="text-on-surface-variant text-sm sm:text-base max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
              <span className="text-primary text-sm font-medium">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-on-background mb-4">
              Loved by <span className="text-primary">Artists</span> Everywhere
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-surface-container rounded-3xl p-6 sm:p-8 border border-surface-variant/20 hover:shadow-lg transition-all"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-on-surface text-base sm:text-lg mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold font-headline text-on-background">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-headline text-on-background mb-4">
              Explore Our Categories
            </h2>
            <p className="text-on-surface-variant text-base sm:text-lg">
              Find your perfect sketch from our diverse collection
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[
              { name: "Animals", emoji: "🦋", count: "24" },
              { name: "Mandalas", emoji: "☸️", count: "18" },
              { name: "Botanical", emoji: "🌸", count: "15" },
              { name: "Fantasy", emoji: "🐉", count: "12" },
              { name: "Geometric", emoji: "⬡", count: "14" },
              { name: "Landscape", emoji: "🏔️", count: "10" },
              { name: "Zentangle", emoji: "🎨", count: "8" },
              { name: "Patterns", emoji: "✦", count: "9" },
            ].map((category) => (
              <Link
                key={category.name}
                href="/signup"
                className="group flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-surface rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{category.emoji}</span>
                <div className="text-left">
                  <span className="block font-semibold">{category.name}</span>
                  <span className="text-xs text-on-surface-variant group-hover:text-white/80">{category.count} sketches</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-tertiary opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-50" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6 sm:mb-8">
            <span className="text-white text-sm font-medium">Join free today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-white mb-6 leading-tight">
            Ready to Unleash Your Inner Artist?
          </h2>
          <p className="text-white/90 mb-8 sm:mb-10 text-base sm:text-lg md:text-xl max-w-xl mx-auto">
            Join thousands of creators already enjoying the calming, creative experience of ColorSketch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold font-headline text-primary bg-white rounded-2xl hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group"
            >
              Create Free Account
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <p className="mt-6 text-white/70 text-sm">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-lg">🎨</span>
                </div>
                <span className="text-xl font-bold font-headline text-on-background">
                  Color<span className="text-primary">Sketch</span>
                </span>
              </Link>
              <p className="text-on-surface-variant text-sm max-w-xs mb-6">
                Your digital canvas for mindful coloring. Relax, create, and find your calm.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {["Twitter", "Instagram", "YouTube"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={social}
                  >
                    {social === "Twitter" && "𝕏"}
                    {social === "Instagram" && "📷"}
                    {social === "YouTube" && "▶"}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold font-headline text-on-background mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li><Link href="/signup" className="hover:text-primary transition-colors">Get Started</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">Features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold font-headline text-on-background mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><span className="opacity-60 cursor-not-allowed">Help Center</span></li>
                <li><span className="opacity-60 cursor-not-allowed">Contact Us</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
            <p>© 2026 ColorSketch. Made with 💜 for artists everywhere.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

