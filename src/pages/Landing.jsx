import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateContentClick = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleExploreLibraryClick = () => {
    if (currentUser) {
      navigate('/assets');
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#191714] font-['Times_New_Roman',Times,serif] antialiased selection:bg-[#DED6C9] selection:text-[#191714]">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-[#F7F3EA] border-b border-[#DED6C9]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="Content Factory Logo" className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex flex-col">
              <Link to="/" className="text-lg font-bold tracking-tight text-[#191714] hover:opacity-90">
                Content Factory
              </Link>
              <span className="text-[9px] uppercase tracking-widest text-[#716B62] font-sans font-medium -mt-1">
                PRO CLOUDINARY SUITE
              </span>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm text-[#191714]">
            <a href="#product" className="hover:text-[#716B62] transition-colors">
              Product
            </a>
            <a href="#how-it-works" className="hover:text-[#716B62] transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-[#716B62] transition-colors">
              Features
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-6 text-sm">
            {currentUser ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-[#191714] text-[#F7F3EA] border border-[#191714] hover:bg-[#2C2723] transition-colors font-medium text-xs tracking-wide"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-[#191714] hover:text-[#716B62] transition-colors font-medium">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-[#191714] text-[#F7F3EA] border border-[#191714] hover:bg-[#2C2723] transition-colors font-medium text-xs tracking-wide"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section id="product" className="py-20 md:py-28 border-b border-[#DED6C9]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-6 space-y-8">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl leading-[1.05] tracking-tight font-normal text-[#191714]">
              One Upload.
              <br />
              <span className="italic font-normal text-[#191714]">Every Format.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#716B62] leading-relaxed max-w-xl font-normal">
              Transform one image into optimized content for social media, web, personal profiles, and commerce — powered by Cloudinary's media processing pipeline.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleCreateContentClick}
                className="px-6 py-3.5 bg-[#191714] text-[#F7F3EA] border border-[#191714] hover:bg-[#2C2723] transition-colors text-base font-medium tracking-wide"
              >
                Create Content
              </button>

              <button
                onClick={handleExploreLibraryClick}
                className="px-6 py-3.5 bg-[#FFFDF9] text-[#191714] border border-[#DED6C9] hover:bg-[#F2ECDE] hover:border-[#C5BBAA] transition-colors text-base font-medium"
              >
                Explore Library
              </button>
            </div>
          </div>

          {/* Right Hero Media Presentation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#FFFDF9] border border-[#DED6C9] p-6 sm:p-8 space-y-6">
              {/* Source Header Label */}
              <div className="flex items-center justify-between border-b border-[#DED6C9] pb-3 text-xs tracking-wider uppercase text-[#716B62] font-sans font-semibold">
                <span>Source Image</span>
                <span>Original Master</span>
              </div>

              {/* Main Source Photographic Visual */}
              <div className="relative border border-[#DED6C9] overflow-hidden bg-[#F7F3EA]">
                <img
                  src="/images/hero_product.png"
                  alt="Editorial product photography master source"
                  className="w-full aspect-[4/3] object-cover block"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000";
                  }}
                />
              </div>

              {/* Derived Format Previews Row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* SOCIAL Format */}
                <div className="border border-[#DED6C9] bg-[#FFFDF9] p-2 space-y-2">
                  <div className="aspect-square bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                    <img
                      src="/images/hero_product.png"
                      alt="Social format 1:1"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                  </div>
                  <div className="text-center font-sans text-[10px] uppercase tracking-widest text-[#716B62] font-semibold">
                    Social 1:1
                  </div>
                </div>

                {/* WEB Format */}
                <div className="border border-[#DED6C9] bg-[#FFFDF9] p-2 space-y-2">
                  <div className="aspect-video bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                    <img
                      src="/images/hero_product.png"
                      alt="Web format 16:9"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                  </div>
                  <div className="text-center font-sans text-[10px] uppercase tracking-widest text-[#716B62] font-semibold">
                    Web 16:9
                  </div>
                </div>

                {/* PROFILE Format */}
                <div className="border border-[#DED6C9] bg-[#FFFDF9] p-2 space-y-2">
                  <div className="aspect-[4/5] bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                    <img
                      src="/images/hero_product.png"
                      alt="Profile format 4:5"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                  </div>
                  <div className="text-center font-sans text-[10px] uppercase tracking-widest text-[#716B62] font-semibold">
                    Profile 4:5
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROBLEM / VALUE SECTION ================= */}
      <section className="py-20 border-b border-[#DED6C9] bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-normal leading-tight text-[#191714]">
              One image shouldn't mean five workflows.
            </h2>
            <p className="text-lg text-[#716B62] leading-relaxed">
              Different platforms require different dimensions, crops, and formats. Content Factory turns one master image into the versions you actually need.
            </p>
          </div>

          {/* 4 Aspect Ratio Examples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1:1 Square */}
            <div className="border border-[#DED6C9] bg-[#F7F3EA] p-4 space-y-3">
              <div className="aspect-square bg-[#FFFDF9] border border-[#DED6C9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                  alt="1:1 Square Transformation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between font-sans text-xs pt-1">
                <span className="font-bold text-[#191714]">1:1 Square</span>
                <span className="text-[#716B62] uppercase tracking-wider text-[10px]">Instagram / Avatar</span>
              </div>
            </div>

            {/* 4:5 Vertical */}
            <div className="border border-[#DED6C9] bg-[#F7F3EA] p-4 space-y-3">
              <div className="aspect-[4/5] bg-[#FFFDF9] border border-[#DED6C9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="4:5 Portrait Transformation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between font-sans text-xs pt-1">
                <span className="font-bold text-[#191714]">4:5 Portrait</span>
                <span className="text-[#716B62] uppercase tracking-wider text-[10px]">Social Feed</span>
              </div>
            </div>

            {/* 9:16 Story */}
            <div className="border border-[#DED6C9] bg-[#F7F3EA] p-4 space-y-3">
              <div className="aspect-[9/16] bg-[#FFFDF9] border border-[#DED6C9] overflow-hidden">
                <img
                  src="/images/editorial_portrait.png"
                  alt="9:16 Vertical Story Transformation"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
              <div className="flex items-center justify-between font-sans text-xs pt-1">
                <span className="font-bold text-[#191714]">9:16 Story</span>
                <span className="text-[#716B62] uppercase tracking-wider text-[10px]">Stories / Mobile</span>
              </div>
            </div>

            {/* 16:9 Landscape */}
            <div className="border border-[#DED6C9] bg-[#F7F3EA] p-4 space-y-3">
              <div className="aspect-video bg-[#FFFDF9] border border-[#DED6C9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000"
                  alt="16:9 Landscape Transformation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between font-sans text-xs pt-1">
                <span className="font-bold text-[#191714]">16:9 Banner</span>
                <span className="text-[#716B62] uppercase tracking-wider text-[10px]">Web Hero / Display</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-[#DED6C9]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="border-b border-[#DED6C9] pb-6 flex items-end justify-between">
            <h2 className="text-3xl sm:text-4xl font-normal text-[#191714]">
              How it works
            </h2>
            <span className="text-xs uppercase tracking-widest text-[#716B62] font-sans font-semibold">
              Workflow Overview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 01 */}
            <div className="border-t border-[#191714] pt-6 space-y-3">
              <span className="text-3xl font-normal text-[#716B62]">01</span>
              <h3 className="text-xl font-bold text-[#191714]">Upload</h3>
              <p className="text-sm text-[#716B62] leading-relaxed">
                Start with one master image.
              </p>
            </div>

            {/* Step 02 */}
            <div className="border-t border-[#191714] pt-6 space-y-3">
              <span className="text-3xl font-normal text-[#716B62]">02</span>
              <h3 className="text-xl font-bold text-[#191714]">Process</h3>
              <p className="text-sm text-[#716B62] leading-relaxed">
                Cloudinary analyzes and transforms the media.
              </p>
            </div>

            {/* Step 03 */}
            <div className="border-t border-[#191714] pt-6 space-y-3">
              <span className="text-3xl font-normal text-[#716B62]">03</span>
              <h3 className="text-xl font-bold text-[#191714]">Generate</h3>
              <p className="text-sm text-[#716B62] leading-relaxed">
                Create platform-ready formats.
              </p>
            </div>

            {/* Step 04 */}
            <div className="border-t border-[#191714] pt-6 space-y-3">
              <span className="text-3xl font-normal text-[#716B62]">04</span>
              <h3 className="text-xl font-bold text-[#191714]">Use</h3>
              <p className="text-sm text-[#716B62] leading-relaxed">
                Download, share, or manage your generated assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CLOUDINARY SECTION ================= */}
      <section id="features" className="py-20 md:py-28 border-b border-[#DED6C9] bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#716B62] font-sans font-semibold">
              Media Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-normal text-[#191714]">
              Powered by Cloudinary.
            </h2>
            <p className="text-lg text-[#716B62] leading-relaxed">
              Cloudinary handles media upload, AI/media analysis, background removal, intelligent cropping, transformations, optimized delivery, and asset search.
            </p>
          </div>

          {/* Typographic Pipeline */}
          <div className="border border-[#DED6C9] bg-[#F7F3EA] p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-1">
                <span className="text-xs font-sans uppercase tracking-widest text-[#716B62]">Step 1</span>
                <p className="text-lg font-bold tracking-tight text-[#191714]">UPLOAD</p>
              </div>

              <div className="hidden md:block text-[#DED6C9] font-normal text-2xl">→</div>

              <div className="space-y-1">
                <span className="text-xs font-sans uppercase tracking-widest text-[#716B62]">Step 2</span>
                <p className="text-lg font-bold tracking-tight text-[#191714]">ANALYZE</p>
              </div>

              <div className="hidden md:block text-[#DED6C9] font-normal text-2xl">→</div>

              <div className="space-y-1">
                <span className="text-xs font-sans uppercase tracking-widest text-[#716B62]">Step 3</span>
                <p className="text-lg font-bold tracking-tight text-[#191714]">TRANSFORM</p>
              </div>

              <div className="hidden md:block text-[#DED6C9] font-normal text-2xl">→</div>

              <div className="space-y-1">
                <span className="text-xs font-sans uppercase tracking-widest text-[#716B62]">Step 4</span>
                <p className="text-lg font-bold tracking-tight text-[#191714]">OPTIMIZE</p>
              </div>

              <div className="hidden md:block text-[#DED6C9] font-normal text-2xl">→</div>

              <div className="space-y-1">
                <span className="text-xs font-sans uppercase tracking-widest text-[#716B62]">Step 5</span>
                <p className="text-lg font-bold tracking-tight text-[#191714]">DELIVER</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= USE CASES ================= */}
      <section className="py-20 md:py-28 border-b border-[#DED6C9]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="border-b border-[#DED6C9] pb-6 flex items-end justify-between">
            <h2 className="text-3xl sm:text-4xl font-normal text-[#191714]">
              Applications
            </h2>
            <span className="text-xs uppercase tracking-widest text-[#716B62] font-sans font-semibold">
              Target Channels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* SOCIAL */}
            <div className="border border-[#DED6C9] bg-[#FFFDF9] p-5 space-y-4">
              <div className="aspect-[4/3] bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                  alt="Social format photography"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#191714]">SOCIAL</h3>
                <p className="text-xs text-[#716B62] leading-relaxed">
                  Create platform-ready social formats.
                </p>
              </div>
            </div>

            {/* WEB */}
            <div className="border border-[#DED6C9] bg-[#FFFDF9] p-5 space-y-4">
              <div className="aspect-[4/3] bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"
                  alt="Web format photography"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#191714]">WEB</h3>
                <p className="text-xs text-[#716B62] leading-relaxed">
                  Generate responsive website imagery.
                </p>
              </div>
            </div>

            {/* PERSONAL */}
            <div className="border border-[#DED6C9] bg-[#FFFDF9] p-5 space-y-4">
              <div className="aspect-[4/3] bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                <img
                  src="/images/editorial_portrait.png"
                  alt="Personal profile photography"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#191714]">PERSONAL</h3>
                <p className="text-xs text-[#716B62] leading-relaxed">
                  Create profile and avatar formats.
                </p>
              </div>
            </div>

            {/* COMMERCE */}
            <div className="border border-[#DED6C9] bg-[#FFFDF9] p-5 space-y-4">
              <div className="aspect-[4/3] bg-[#F7F3EA] border border-[#DED6C9] overflow-hidden">
                <img
                  src="/images/hero_product.png"
                  alt="Commerce product photography"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#191714]">COMMERCE</h3>
                <p className="text-xs text-[#716B62] leading-relaxed">
                  Create clean product-ready imagery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 border-b border-[#DED6C9] bg-[#FFFDF9]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-normal leading-tight text-[#191714]">
            One image.
            <br />
            <span className="italic">Every format you need.</span>
          </h2>

          <div>
            <button
              onClick={handleCreateContentClick}
              className="px-8 py-4 bg-[#191714] text-[#F7F3EA] border border-[#191714] hover:bg-[#2C2723] transition-colors text-base font-medium tracking-wide"
            >
              Create Content
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 bg-[#F7F3EA]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="Content Factory Logo" className="w-7 h-7 rounded-lg shrink-0" />
            <div className="space-y-0.5">
              <span className="text-lg font-bold text-[#191714]">Content Factory</span>
              <p className="text-xs text-[#716B62] font-sans">
                Editorial Media Transformation Engine
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-sm text-[#191714]">
            <a href="#product" className="hover:text-[#716B62] transition-colors">
              Product
            </a>
            <a href="#features" className="hover:text-[#716B62] transition-colors">
              Features
            </a>
            <button onClick={handleExploreLibraryClick} className="hover:text-[#716B62] transition-colors">
              Library
            </button>
            <a href="#how-it-works" className="hover:text-[#716B62] transition-colors">
              About
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#716B62] transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://cloudinary.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#716B62] transition-colors"
            >
              Cloudinary
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
