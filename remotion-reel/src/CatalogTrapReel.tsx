import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Img,
} from "remotion";
import React from "react";

// ==========================================
// SCENE 1: THE HOOK (0 - 4s / 0 - 120 frames)
// ==========================================
const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Floating elements entry spring
  const cardEntry = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  const cardTranslateY = interpolate(cardEntry, [0, 1], [350, 0]);
  const cardOpacity = interpolate(cardEntry, [0, 1], [0, 1]);

  // Character zoom & breath animation
  const charScale = interpolate(cardEntry, [0, 1], [0.8, 1.0]);
  const charY = interpolate(cardEntry, [0, 1], [120, 0]);
  const breath = Math.sin(frame * 0.05) * 5;

  // Trap alert shake trigger at frame 208 (6.94 seconds)
  const shakeFrame = frame - 208;
  const shakeX =
    shakeFrame > 0 && shakeFrame < 25
      ? Math.sin(shakeFrame * 1.5) *
        15 *
        interpolate(shakeFrame, [0, 25], [1, 0])
      : 0;

  // Trap banner entry (starts at frame 210)
  const trapBannerProgress = spring({
    frame: frame - 210,
    fps,
    config: { damping: 10, mass: 0.8 },
  });
  const trapScale = interpolate(trapBannerProgress, [0, 1], [0.3, 1]);
  const trapOpacity = interpolate(trapBannerProgress, [0, 1], [0, 1]);

  // Ken Burns background scale
  const bgScale = interpolate(frame, [0, 253], [1.0, 1.08]);

  // Sparkly gold points particles rising and swirling around the credit card
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const angleOffset = (i * Math.PI * 2) / 20;
    const radius = 240 + Math.sin(frame * 0.06 + i) * 30;
    const speed = 2.0 + (i % 2) * 1.0;
    const x = 540 + Math.cos(frame * 0.04 + angleOffset) * radius;
    const y =
      1110 +
      Math.sin(frame * 0.04 + angleOffset) * radius -
      ((frame * speed) % 300);
    const size = 6 + (i % 3) * 4;
    const opacity = interpolate(frame, [0, 15, 230, 253], [0, 0.7, 0.7, 0]);
    return { x, y, size, opacity, id: i };
  });

  return (
    <AbsoluteFill className="overflow-hidden font-sans relative select-none">
      {/* Anime Background with Ken Burns panning */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          transform: `scale(${bgScale})`,
        }}
      >
        <Img
          src={staticFile("bg_shopping_store_anime.jpg")}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Background overlay for styling */}
      <div className="absolute inset-0 bg-slate-950/15 z-1" />

      {/* Floating Sparkly Points Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-400 blur-[1px] shadow-[0_0_12px_#f59e0b] pointer-events-none z-15"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Top Header */}
      <div className="absolute top-[260px] w-full text-center z-20">
        <span className="text-white font-black tracking-[0.3em] text-4xl uppercase text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          MEET AMIT
        </span>
      </div>

      {/* Amit Character Portrait (Glass Framed Card) */}
      <div
        className="absolute top-[380px] left-[190px] w-[700px] h-[520px] rounded-[32px] overflow-hidden border-[6px] border-amber-500/80 shadow-2xl bg-slate-900 z-10"
        style={{
          opacity: cardOpacity,
          transform: `scale(${charScale}) translateY(${charY + breath}px)`,
        }}
      >
        <Img
          src={staticFile("amit_portrait_anime.png")}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Platinum Credit Card Section */}
      <div
        className="absolute top-[920px] left-[220px] w-[640px] h-[400px] z-20"
        style={{
          transform: `translateY(${cardTranslateY}px) translateX(${shakeX}px)`,
          opacity: cardOpacity,
        }}
      >
        <div className="w-full h-full bg-[#0c0f1d] rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden card-shadow border border-white/20">
          {/* Card background glowing elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#D4AF37] rounded-full blur-[90px] opacity-35" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-red-600 rounded-full blur-[90px] opacity-25" />

          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/90 text-base font-black uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                REWARDS CARD
              </p>
              <h2 className="text-[#FFE082] text-4xl font-black tracking-wider mt-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                PLATINUM
              </h2>
            </div>
            {/* Gold chip */}
            <div className="w-16 h-12 bg-gradient-to-br from-[#FFE082] via-[#D4AF37] to-[#8C6D0F] rounded-xl border border-yellow-200/40 flex flex-col justify-around p-1.5 shadow-lg">
              <div className="w-full h-[2px] bg-black/20" />
              <div className="w-full h-[2px] bg-black/20" />
              <div className="w-[60%] h-[60%] border-r-2 border-t-2 border-black/20" />
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/85 text-xl tracking-widest font-mono font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                100,000 POINTS
              </p>
              <p className="text-white/95 text-lg tracking-widest mt-2 font-mono font-black uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                AMIT KUMAR
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-lg">
              <span className="text-[#D4AF37] font-black text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                P
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LUCKILY, HE STOPPED Banner */}
      <div 
        className="absolute top-[860px] w-full flex justify-center z-20"
        style={{
          transform: `scale(${trapScale})`,
          opacity: trapOpacity,
        }}
      >
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white font-black text-3xl py-4 px-10 rounded-full shadow-2xl shadow-emerald-600/30 border border-emerald-500/50 flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3.5}
            stroke="currentColor"
            className="w-7 h-7 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
            />
          </svg>
          <span>LUCKILY, HE STOPPED!</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 2: THE DECEPTION (4 - 11s / 120 - 330 frames)
// ==========================================
const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 219], [1.0, 1.08]);

  // Slide left item from left
  const itemSlide = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14 },
  });
  const itemX = interpolate(itemSlide, [0, 1], [-800, 0]);
  const itemOpacity = interpolate(itemSlide, [0, 1], [0, 1]);

  // Slide calculator from right
  const calcSlide = spring({
    frame: frame - 80,
    fps,
    config: { damping: 14 },
  });
  const calcX = interpolate(calcSlide, [0, 1], [800, 0]);
  const calcOpacity = interpolate(calcSlide, [0, 1], [0, 1]);

  // Counting logic for Points value
  const startFrame = 90;
  const countDuration = 60;
  const pointCounter = interpolate(
    frame,
    [startFrame, startFrame + countDuration],
    [0, 100000],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const pointsString = Math.round(pointCounter).toLocaleString();

  // Calculation stamp pop (frame 160)
  const stampProgress = spring({
    frame: frame - 160,
    fps,
    config: { damping: 8, stiffness: 100 },
  });
  const stampScale = interpolate(stampProgress, [0, 1], [2, 1], {
    extrapolateRight: "clamp",
  });
  const stampOpacity = interpolate(stampProgress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Desaturate & warn card transition starting at frame 170
  const lockProgress = interpolate(frame, [170, 195], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardSaturate = interpolate(lockProgress, [0, 1], [100, 20]);
  const warningBorderOpacity = interpolate(lockProgress, [0, 1], [0, 1]);

  // Generate 8 floating red numbers descending (The Loss Waterfall)
  const fallingLosses = Array.from({ length: 8 }).map((_, i) => {
    const x = 80 + i * 130;
    const speed = 2.5 + (i % 3) * 1.5;
    const y = (frame * speed + i * 240) % 1920;
    const values = ["-75%", "₹0.25", "LOSS", "TRAP", "0.25", "-₹75,000"];
    const text = values[i % values.length];
    const opacity = interpolate(y, [0, 150, 1770, 1920], [0, 0.25, 0.25, 0]);
    return { x, y, text, opacity, id: i };
  });

  return (
    <AbsoluteFill className="overflow-hidden font-sans relative select-none">
      {/* Background Shop Anime with Ken Burns panning */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          transform: `scale(${bgScale})`,
        }}
      >
        <Img
          src={staticFile("bg_shopping_store_anime.jpg")}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark slate backdrop filter to shift the storytelling mood */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] z-1" />

      {/* Falling Loss numbers in background */}
      {fallingLosses.map((item) => (
        <div
          key={item.id}
          className="absolute font-black text-red-500/30 text-3xl font-mono tracking-wider pointer-events-none z-5"
          style={{
            left: item.x,
            top: item.y,
            opacity: item.opacity,
          }}
        >
          {item.text}
        </div>
      ))}

      {/* Top Header */}
      <div className="absolute top-[260px] w-full text-center z-20">
        <span className="text-red-500 font-black tracking-[0.25em] text-3xl uppercase block text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          THE DECEPTION
        </span>
        <h2 className="text-white text-5xl font-extrabold tracking-tight mt-1 text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Bank Catalog Value
        </h2>
      </div>

      {/* Left catalog item (Voucher) - Glass theme with lock alerts */}
      <div
        className="absolute top-[380px] left-[220px] w-[640px] h-[200px] bg-slate-900/60 rounded-3xl p-5 border border-slate-700 shadow-2xl relative overflow-hidden z-20 flex flex-col justify-between"
        style={{
          transform: `translateX(${itemX}px)`,
          opacity: itemOpacity,
          filter: `saturate(${cardSaturate}%)`,
        }}
      >
        {/* Warning Border Alert */}
        <div
          className="absolute inset-0 border-4 border-red-600/70 rounded-3xl pointer-events-none"
          style={{ opacity: warningBorderOpacity }}
        />

        <div className="flex gap-4 items-center relative z-10">
          {/* Styled Amazon Voucher Card Icon */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border border-orange-400 flex flex-col items-center justify-center relative p-1 shrink-0 shadow-md">
            <div className="w-8 h-8 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center">
              <span className="text-orange-400 font-black text-xs font-mono">
                a
              </span>
            </div>
          </div>

          <div className="text-left flex-grow">
            <span className="bg-red-950/80 border border-red-700 text-red-400 rounded-full py-0.5 px-3 text-[10px] font-black tracking-widest uppercase shadow-sm">
              CATALOG STORE
            </span>
            <h3 className="text-white text-2xl font-black tracking-wide mt-1">
              Amazon Voucher
            </h3>
          </div>

          <div className="text-right shrink-0">
            <p className="text-slate-400 text-xs font-bold">Value:</p>
            <p className="text-emerald-400 text-2xl font-black">
              ₹25,000 Retail
            </p>
          </div>
        </div>

        <div className="mt-2 pt-3 border-t border-slate-700/60 flex justify-between items-center bg-slate-950/40 -mx-5 -mb-5 px-5 pb-3 relative z-10">
          <span className="text-slate-300 text-sm font-black uppercase">
            Points Demanded:
          </span>
          <span className="text-red-500 text-3xl font-black tracking-tight font-mono">
            {pointsString}
          </span>
        </div>
      </div>

      {/* Right evaluation calculator (The Deception Formula) - Translucent Glassmorphism */}
      <div
        className="absolute top-[640px] left-[220px] w-[640px] h-[310px] glassmorphism rounded-3xl p-5 shadow-2xl relative overflow-hidden z-20 flex flex-col justify-between"
        style={{ transform: `translateX(${calcX}px)`, opacity: calcOpacity }}
      >
        <div className="flex justify-between items-start">
          <div className="text-left flex-grow">
            <h4 className="text-amber-400 font-black text-xl uppercase tracking-wider">
              VALUATION ENGINE
            </h4>
            <div className="flex flex-col gap-1.5 mt-2.5 text-left">
              <div className="flex justify-between items-center text-slate-200 font-black text-lg w-[260px]">
                <span>Item Value</span>
                <span className="text-emerald-400 font-black font-mono">
                  ₹25,000
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-sm font-mono font-black border-b border-white/10 pb-2 w-[260px]">
                <span>Divided by Cost</span>
                <span className="text-red-400 font-bold">÷ 100,050 pts</span>
              </div>
              <div className="flex justify-between items-center mt-1 w-[260px] text-white font-black text-md">
                <span>Yield Per Point:</span>
              </div>
            </div>
          </div>

          <div className="text-right w-[300px] flex flex-col items-end justify-center h-full mt-3">
            <div className="relative h-24 flex items-center justify-end pr-2">
              <span
                className="text-red-500 font-black text-8xl font-mono text-glow-red"
                style={{
                  transform: `scale(${stampScale})`,
                  opacity: stampOpacity,
                  display: "inline-block",
                }}
              >
                ₹0.25
              </span>
            </div>
          </div>
        </div>

        {/* Under 25 paise indicator warning */}
        <div
          className="bg-red-950/70 border border-red-900 text-red-200 rounded-2xl p-2.5 flex gap-2.5 items-center shadow-lg"
          style={{ opacity: stampOpacity }}
        >
          <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm animate-pulse">
            !
          </div>
          <div className="text-left">
            <p className="text-red-400 text-base font-black leading-none">
              25 Paise / Point Yield
            </p>
            <p className="text-red-300/80 text-xs font-bold mt-0.5">
              This is a massive loss. Banks count on this to profit.
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 3: THE MATH FLIP (11 - 20s / 330 - 600 frames)
// ==========================================
const Scene3Math: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 348], [1.0, 1.08]);

  // Left card slide-in from left
  const leftSlide = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const leftX = interpolate(leftSlide, [0, 1], [-800, 0]);
  const leftOpacity = interpolate(leftSlide, [0, 1], [0, 1]);

  // Right card slide-in from right
  const rightSlide = spring({
    frame: frame - 95,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const rightX = interpolate(rightSlide, [0, 1], [800, 0]);
  const rightOpacity = interpolate(rightSlide, [0, 1], [0, 1]);

  // Math flips badge entry (frame 240)
  const badgePop = spring({
    frame: frame - 240,
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  const badgeScale = interpolate(badgePop, [0, 1], [0.3, 1]);
  const badgeOpacity = interpolate(badgePop, [0, 1], [0, 1]);

  // Yield numbers ticking
  const countProgress = interpolate(frame, [240, 290], [1.0, 8.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const countStr = countProgress.toFixed(1);

  // Flying jet vector motion path (Scene 3)
  const planeProgress = interpolate(frame, [90, 310], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const planeX = interpolate(planeProgress, [0, 1], [-200, 1280]);
  const planeY = interpolate(planeProgress, [0, 1], [900, -100]);

  // Generate trailing stardust particles behind the flight path
  const dustParticles = Array.from({ length: 15 }).map((_, i) => {
    const triggerFrame = 90 + i * 15;
    const active = frame >= triggerFrame;
    const activeAge = frame - triggerFrame;
    const progressAtTrigger = interpolate(triggerFrame, [90, 310], [0, 1]);
    const startX = interpolate(progressAtTrigger, [0, 1], [-200, 1280]);
    const startY = interpolate(progressAtTrigger, [0, 1], [900, -100]);

    const x = startX + Math.sin(activeAge * 0.1) * 15;
    const y = startY - activeAge * 1.5;
    const scale = interpolate(activeAge, [0, 30], [1.2, 0], {
      extrapolateRight: "clamp",
    });
    const opacity = active
      ? interpolate(activeAge, [0, 10, 30], [0, 0.9, 0], {
          extrapolateRight: "clamp",
        })
      : 0;
    return { x, y, scale, opacity, id: i };
  });

  // Elliptical Orbit Loop for airline bubbles (centered at 540, centerY)
  const angle = frame * 0.04;
  const centerX = 540;
  const centerY = 560;
  const rx = 350;
  const ry = 160;

  const sqX = centerX + Math.cos(angle) * rx;
  const sqY = centerY + Math.sin(angle) * ry;

  const qrX = centerX + Math.cos(angle + (Math.PI * 2) / 3) * rx;
  const qrY = centerY + Math.sin(angle + (Math.PI * 2) / 3) * ry;

  const allX = centerX + Math.cos(angle + (Math.PI * 4) / 3) * rx;
  const allY = centerY + Math.sin(angle + (Math.PI * 4) / 3) * ry;

  return (
    <AbsoluteFill className="overflow-hidden font-sans relative select-none">
      {/* Sunset Clouds background with Ken Burns scale */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          transform: `scale(${bgScale})`,
        }}
      >
        <Img
          src={staticFile("bg_clouds_sunset_anime.jpg")}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-slate-950/15 z-1" />

      {/* Trailing Stardust Particles */}
      {dustParticles.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full bg-amber-300 blur-[0.5px] shadow-[0_0_10px_#f59e0b] pointer-events-none z-15"
          style={{
            left: d.x,
            top: d.y,
            width: 14,
            height: 14,
            transform: `scale(${d.scale})`,
            opacity: d.opacity,
          }}
        />
      ))}

      {/* Animated Jet Vector Flying Across Background */}
      <div
        className="absolute z-15 pointer-events-none"
        style={{
          transform: `translate(${planeX}px, ${planeY}px) rotate(-35deg) scale(1.6)`,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-16 h-16 text-amber-400 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
        >
          <path d="M6 12L18 4L14 12L22 13L10 19L6 12Z" fill="#F59E0B" />
          <path d="M6 12L2 14V17L5 15.5L6 12Z" fill="#D97706" />
        </svg>
      </div>

      {/* Orbiting Partner Logo Bubbles */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Singapore Airlines bubble */}
        <div
          className="absolute w-20 h-20 bg-white border-4 border-[#002B49] rounded-full flex items-center justify-center shadow-2xl pointer-events-auto"
          style={{
            left: sqX,
            top: sqY,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <span className="text-[#002B49] font-black text-base font-sans">
            SQ
          </span>
        </div>

        {/* Qatar Airways bubble */}
        <div
          className="absolute w-20 h-20 bg-white border-4 border-[#8A1538] rounded-full flex items-center justify-center shadow-2xl pointer-events-auto"
          style={{
            left: qrX,
            top: qrY,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <span className="text-[#8A1538] font-black text-base font-sans">
            QR
          </span>
        </div>

        {/* Accor Hotels bubble */}
        <div
          className="absolute w-20 h-20 bg-white border-4 border-slate-800 rounded-full flex items-center justify-center shadow-2xl pointer-events-auto"
          style={{
            left: allX,
            top: allY,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <span className="text-slate-800 font-black text-xs font-sans">
            ALL
          </span>
        </div>
      </div>

      {/* Top Title */}
      <div className="absolute top-[260px] w-full text-center z-20">
        <span className="text-amber-400 font-black tracking-[0.25em] text-3xl uppercase block text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          THE COMPARISON
        </span>
        <h2 className="text-white text-5xl font-extrabold tracking-tight mt-1 text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Where do points yield more?
        </h2>
      </div>

      {/* Central flying card visualization block (starts around Y=440px) */}
      <div className="absolute top-[440px] left-[140px] w-[800px] h-[300px] rounded-[32px] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-10">
        <div className="text-center p-6">
          <p className="text-amber-400 font-black text-lg tracking-widest uppercase">AIRPORT ESCAPE</p>
          <h3 className="text-white font-black text-3xl mt-1.5">100,000 Points Arbitrage</h3>
          <p className="text-slate-300 text-sm mt-1.5 max-w-[540px] mx-auto font-medium leading-relaxed">Instead of shopping catalogs, Amit transferred his points directly into luxury air mileage.</p>
        </div>
      </div>

      {/* Card 1: Bank Catalog Deception - Translucent styling */}
      <div
        className="absolute top-[800px] left-[220px] w-[640px] h-[150px] bg-slate-950/65 rounded-3xl p-4 border border-slate-700 flex justify-between items-center shadow-2xl z-20"
        style={{ transform: `translateX(${leftX}px)`, opacity: leftOpacity }}
      >
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75-3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest leading-none">
              Catalog Yield
            </p>
            <h3 className="text-slate-300 font-black text-xl mt-1">
              ₹25,000 Voucher
            </h3>
            <p className="text-slate-400 text-xs font-bold mt-0.5">
              Value: 25 Paise / Point
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-slate-500 font-mono text-xs block font-black uppercase">
            Points Cost:
          </span>
          <span className="text-red-400 font-black text-2xl font-mono">
            100,000
          </span>
        </div>
      </div>

      {/* Card 2: Airlines Transfer Arbitrage - Gold Glass theme */}
      <div
        className="absolute top-[970px] left-[220px] w-[640px] h-[170px] bg-slate-900/60 rounded-3xl p-4 border-2 border-amber-500 flex justify-between items-center shadow-2xl animate-shine-fast z-20"
        style={{ transform: `translateX(${rightX}px)`, opacity: rightOpacity }}
      >
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700 flex items-center justify-center text-amber-400 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-amber-400 text-xs font-black uppercase tracking-widest leading-none">
              Airlines Yield
            </p>
            <h3 className="text-white font-black text-2xl font-serif-luxury tracking-wide mt-1">
              Business Class to London
            </h3>
            <p className="text-emerald-400 text-sm font-black mt-0.5">
              Value: ₹2,00,000
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-slate-400 font-mono text-xs block font-black uppercase">
            Points Cost:
          </span>
          <span className="text-amber-400 font-black text-2xl font-mono">
            100,000
          </span>
        </div>
      </div>

      {/* 8X Yield Multiplier Stamp Box */}
      <div
        className="absolute top-[1160px] left-[220px] w-[640px] h-[150px] flex justify-center z-20"
        style={{
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
        }}
      >
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 backdrop-blur-md px-6 py-4 w-full rounded-3xl border-2 border-amber-400/80 shadow-2xl flex items-center gap-5 text-white">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#FFE082] via-[#D4AF37] to-[#8C6D0F] flex items-center justify-center shadow-md relative shrink-0">
            <span className="text-slate-950 font-black text-6xl tracking-tighter">
              {countStr}X
            </span>
            <div className="absolute inset-0 border border-white/30 rounded-2xl animate-pulse-ring pointer-events-none" />
          </div>
          <div className="text-left">
            <h4 className="text-amber-400 font-black text-2xl tracking-tight uppercase">
              8X YIELD FLIPPED!
            </h4>
            <p className="text-emerald-400 font-black text-lg mt-0.5">
              Get up to ₹2.00 value per point!
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 4: THE APP REVEAL (20 - 25s / 600 - 750 frames)
// ==========================================
const Scene4App: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 319], [1.0, 1.08]);

  // Smartphone entry slide up
  const phoneSlide = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const phoneY = interpolate(phoneSlide, [0, 1], [800, 0]);
  const phoneOpacity = interpolate(phoneSlide, [0, 1], [0, 1]);

  // Click gesture animation (cursor tap at frame 160)
  const clickFrame = frame - 160;
  const clickScale = spring({
    frame: clickFrame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const ringScale = interpolate(clickScale, [0, 1], [0.8, 2.5]);
  const ringOpacity = interpolate(clickFrame, [0, 10, 20], [0, 0.7, 0]);

  // Cursor pointer slide in
  const cursorX = interpolate(clickFrame, [-20, 0, 10], [60, 0, 15], {
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(clickFrame, [-20, 0, 10], [80, 0, 25], {
    extrapolateRight: "clamp",
  });
  const cursorOpacity = interpolate(
    clickFrame,
    [-25, -20, 20, 30],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Optimizer sequence visual update (starts at frame 165)
  const optProgress = spring({
    frame: frame - 165,
    fps,
    config: { damping: 14 },
  });
  const mathVal = interpolate(optProgress, [0, 1], [25000, 200000]);
  const mathValStr = Math.round(mathVal).toLocaleString();

  const optimizedTextOpacity = interpolate(frame, [175, 195], [0, 1], {
    extrapolateRight: "clamp",
  });
  const optimizedTextScale = interpolate(frame, [175, 195], [0.9, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="overflow-hidden font-sans relative select-none">
      {/* Resort Pool background with Ken Burns scale */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          transform: `scale(${bgScale})`,
        }}
      >
        <Img
          src={staticFile("bg_resort_pool_anime.jpg")}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-slate-950/20 z-1" />

      {/* Tech Grid connection nodes in background */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none z-5">
        <circle
          cx="200"
          cy="400"
          r="8"
          fill="#F59E0B"
          className="animate-pulse"
        />
        <circle cx="880" cy="600" r="10" fill="#6366f1" />
        <circle cx="150" cy="1500" r="6" fill="#F59E0B" />
        <circle
          cx="900"
          cy="1400"
          r="8"
          fill="#10b981"
          className="animate-pulse"
        />

        {/* Inter-node connecting paths */}
        <path
          d="M200,400 Q540,650 880,600"
          stroke="#f59e0b"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="6,8"
        />
        <path
          d="M150,1500 Q540,1450 900,1400"
          stroke="#10b981"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="6,8"
        />
      </svg>

      {/* Top Title */}
      <div className="absolute top-[260px] w-full text-center z-20">
        <span className="text-emerald-400 font-black tracking-[0.25em] text-3xl uppercase block text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          THE SOLUTION
        </span>
        <h2 className="text-white text-5xl font-extrabold tracking-tight mt-1 text-shadow-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          The Points Array App
        </h2>
      </div>

      {/* Smartphone Mockup - Glassmorphic / Translucent Modern Layout */}
      <div
        className="absolute top-[550px] left-[350px] w-[380px] h-[520px] z-20"
        style={{ transform: `translateY(${phoneY}px)`, opacity: phoneOpacity }}
      >
        {/* Phone Body Container */}
        <div className="w-full h-full bg-white/10 backdrop-blur-2xl rounded-[36px] border-[6px] border-slate-300/40 relative shadow-2xl p-4 overflow-hidden flex flex-col justify-between text-white">
          {/* Phone speaker slit */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-white/20 rounded-full flex items-center justify-center p-0.5 z-20">
            <div className="w-12 h-[3px] bg-white/30 rounded-full" />
          </div>

          {/* App UI Header */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FFE082] to-[#D4AF37] rounded-lg flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
                P
              </div>
              <span className="text-white font-black text-base tracking-wider uppercase">
                The Points Array
              </span>
            </div>
            <span className="text-slate-300 text-xs font-mono font-black tracking-widest">
              v1.2.0
            </span>
          </div>

          {/* Connected Cards Section */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-baseline">
              <h3 className="text-slate-300 font-black text-xs tracking-wide uppercase">
                Active Ledgers
              </h3>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                CONNECTED
              </span>
            </div>

            {/* Card 1: Axis Magnus */}
            <div className="w-full bg-white/10 border border-amber-400/30 rounded-xl p-2.5 flex justify-between items-center shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-12 h-12 bg-amber-500/10 rounded-full blur-md" />
              <div className="text-left">
                <span className="text-amber-400 text-[10px] font-black tracking-wider uppercase">
                  AXIS MAGNUS
                </span>
                <p className="text-white font-black text-xl mt-0.5 font-mono">
                  100,000 pts
                </p>
              </div>
            </div>

            {/* Card 2: HDFC Infinia */}
            <div className="w-full bg-white/10 border border-white/15 rounded-xl p-2.5 flex justify-between items-center shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-12 h-12 bg-indigo-500/10 rounded-full blur-md" />
              <div className="text-left">
                <span className="text-slate-300 text-[10px] font-black tracking-wider uppercase">
                  HDFC INFINIA
                </span>
                <p className="text-white font-black text-xl mt-0.5 font-mono">
                  85,000 pts
                </p>
              </div>
            </div>
          </div>

          {/* Calculator Output Display Box */}
          <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3.5 my-1.5 flex flex-col items-center justify-center relative min-h-[110px] shadow-sm">
            <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">
              Total Yield Value
            </p>
            <h4 className="text-emerald-400 text-5.5xl font-black tracking-tight mt-1.5 font-mono text-glow-gold">
              ₹{mathValStr}
            </h4>

            {/* Optimized yield details */}
            <div
              className="mt-1.5 bg-amber-400 text-slate-950 font-black py-0.5 px-3 rounded-lg text-[10px] tracking-widest uppercase shadow border border-amber-300/30"
              style={{
                opacity: optimizedTextOpacity,
                transform: `scale(${optimizedTextScale})`,
              }}
            >
              🎉 8X YIELD DETECTED
            </div>
          </div>

          {/* Interactive Button */}
          <div className="relative mt-auto mb-1">
            <button className="w-full py-2.5 bg-gradient-to-r from-[#FFE082] via-[#D4AF37] to-[#B38F1D] text-slate-950 font-black text-xs rounded-xl shadow-md border-t border-yellow-200/40 tracking-widest uppercase relative z-10 flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={4}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
              OPTIMIZE YIELD
            </button>

            {/* Click pointer indicator */}
            {frame >= 35 && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  top: "15px",
                  left: "70%",
                  transform: `translate(${cursorX}px, ${cursorY}px)`,
                  opacity: cursorOpacity,
                }}
              >
                <div className="relative">
                  {/* Cursor ripple ring */}
                  <div
                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full border-2 border-white bg-white/30 pointer-events-none"
                    style={{
                      transform: `scale(${ringScale})`,
                      opacity: ringOpacity,
                    }}
                  />
                  {/* Mouse click cursor arrow */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  >
                    <path
                      d="M4.5 3V21L10.2 15.3L19.5 15.3L4.5 3Z"
                      stroke="black"
                      strokeWidth={1.5}
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 5: OUTRO / CTA (25 - 32s / 750 - 960 frames)
// ==========================================
const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 376], [1.0, 1.06]);

  const fadeOutOpacity = interpolate(frame, [346, 375], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const transitionProgress = interpolate(
    frame,
    [221, 241],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Logo scale spring entry
  const logoEntry = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14 },
  });
  const logoScale = interpolate(logoEntry, [0, 1], [0.6, 1]);
  const logoOpacity = interpolate(logoEntry, [0, 1], [0, 1]);

  // CTA badges entry (frame 115)
  const badgeEntry = spring({
    frame: frame - 115,
    fps,
    config: { damping: 16 },
  });
  const badgeY = interpolate(badgeEntry, [0, 1], [30, 0]);
  const badgeOpacity = interpolate(badgeEntry, [0, 1], [0, 1]);

  // Magical floaty sparkles in background (warp path style)
  const sparkles = Array.from({ length: 15 }).map((_, i) => {
    const startX = 80 + i * 65;
    const speed = 1.2 + (i % 3) * 0.4;
    const y = 1920 - ((frame * speed + i * 160) % 1920);
    const size = 5 + (i % 2) * 5;
    const opacity = interpolate(y, [0, 200, 1720, 1920], [0, 0.45, 0.45, 0]);
    return { x: startX, y, size, opacity, id: i };
  });

  return (
    <AbsoluteFill className="overflow-hidden font-sans relative select-none">
      {/* Traveler Amit business class scene full-screen backdrop */}
      <div
        className="absolute inset-0 w-full h-full z-0"
        style={{
          transform: `scale(${bgScale})`,
        }}
      >
        <Img
          src={staticFile("amit_traveler_anime.png")}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-slate-950/15 z-1" />

      {/* Floating Sparkles in Background */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-amber-300 blur-[1px] pointer-events-none z-5 shadow-[0_0_8px_#f59e0b]"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {/* Logo Branding Floating Card (translucent glassmorphic container Y = 340px to 740px) */}
      <div
        className="absolute top-[340px] left-[140px] w-[800px] h-[400px] bg-slate-950/40 backdrop-blur-lg border border-white/15 rounded-3xl p-6 flex flex-col items-center justify-center text-white shadow-2xl z-20"
        style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-[#FFE082] via-[#D4AF37] to-[#8C6D0F] rounded-2xl flex items-center justify-center shadow-lg border border-white/25">
          <span className="text-slate-950 font-black text-4xl tracking-tighter">
            P
          </span>
        </div>

        <h1 className="text-white text-5xl font-black tracking-tight mt-4 uppercase text-center text-shadow-md">
          The Points Array
        </h1>

        <p className="text-amber-400 text-sm tracking-[0.25em] font-black mt-2 uppercase text-shadow-sm">
          Ultimate Points Tracker
        </p>
      </div>

      {/* Transitional Clean Outro Panel (Name and Logo Transition at Frame 1360) */}
      {frame >= 221 && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white"
          style={{
            opacity: transitionProgress,
            background: "linear-gradient(to bottom, #0f1225, #090b16, #04050a)",
          }}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{
              transform: `scale(${interpolate(
                frame,
                [221, 376],
                [0.95, 1.05],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )})`,
            }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#FFE082] via-[#D4AF37] to-[#8C6D0F] rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.4)] border border-white/20 relative animate-pulse-ring">
              <span className="text-slate-950 font-black text-6xl tracking-tighter">
                P
              </span>
            </div>

            <h1 className="text-white text-6xl font-black tracking-tight mt-8 uppercase text-center text-shadow-lg drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              The Points Array
            </h1>

            <p className="text-amber-400 text-lg tracking-[0.3em] font-black mt-3 uppercase text-shadow-md">
              Ultimate Points Tracker
            </p>

            {/* Download Badges (App Store and Google Play side-by-side) */}
            <div
              className="flex gap-6 mt-10 z-20"
              style={{ transform: `translateY(${badgeY}px)`, opacity: badgeOpacity }}
            >
              {/* App Store button */}
              <div className="w-48 h-14 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 px-4 shadow-xl hover:bg-slate-900 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-white"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.22-.58 2.94-1.39z" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">
                    Download on the
                  </span>
                  <span className="text-white text-md font-bold leading-tight mt-0.5">
                    App Store
                  </span>
                </div>
              </div>

              {/* Google Play button */}
              <div className="w-48 h-14 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3 px-4 shadow-xl hover:bg-slate-900 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-white"
                >
                  <path d="M3.609 1.814L13.783 12L3.609 22.186A2.22 2.22 0 0 1 3 20.59V3.41c0-.645.23-1.21.609-1.596zm11.232 9.124l3.18-3.18a2.203 2.203 0 0 1 0 3.12l-3.18 3.18a2.203 2.203 0 0 1 0-3.12zm-2.072 2.072L4.697 21.082l9.088-9.088 2.072 2.072zm0-2.02L4.697 2.918l9.088 9.088-2.072-2.072z" />
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none">
                    Get it on
                    </span>
                  <span className="text-white text-md font-bold leading-tight mt-0.5">
                    Google Play
                  </span>
                </div>
              </div>
            </div>

            <div
              className="mt-8 bg-white/5 border border-white/10 rounded-full py-2.5 px-8 shadow-inner flex items-center justify-center"
              style={{ transform: `translateY(${badgeY}px)`, opacity: badgeOpacity }}
            >
              <span className="text-slate-300 text-sm font-bold tracking-wide">
                Link in Bio to Download
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Fade Out to Black in the final 30 frames of the composition */}
      {frame >= 346 && (
        <div
          className="absolute inset-0 bg-black z-50 pointer-events-none"
          style={{ opacity: fadeOutOpacity }}
        />
      )}
    </AbsoluteFill>
  );
};

// ==========================================
// CAPTIONS SYSTEM DATA & COMPONENT
// ==========================================
interface CaptionItem {
  start: number;
  end: number;
  text: string;
  highlight: string[];
}

const CAPTIONS_DATA: CaptionItem[] = [
  // Scene 1 (0 to 253)
  { start: 3, end: 33, text: "MEET AMIT.", highlight: ["AMIT"] },
  {
    start: 33,
    end: 208,
    text: "HE JUST EARNED 100,000 POINTS",
    highlight: ["100,000", "POINTS"],
  },
  {
    start: 208,
    end: 253,
    text: "LUCKILY, HE STOPPED.",
    highlight: ["LUCKILY", "STOPPED"],
  },

  // Scene 2 (253 to 472)
  {
    start: 253,
    end: 315,
    text: "BANKS ACTIVELY DESIGN THEIR CATALOGS",
    highlight: ["BANKS", "CATALOGS"],
  },
  {
    start: 315,
    end: 384,
    text: "TO VALUE YOUR POINTS UNDER 25 PAISE EACH,",
    highlight: ["VALUE", "25", "PAISE"],
  },
  {
    start: 384,
    end: 435,
    text: "HOPING YOU WILL TAKE THE VOUCHER",
    highlight: ["VOUCHER"],
  },
  {
    start: 435,
    end: 472,
    text: "TO SAVE THEIR PROFIT MARGINS.",
    highlight: ["PROFIT", "MARGINS"],
  },

  // Scene 3 (472 to 820)
  {
    start: 472,
    end: 558,
    text: "BUT WHEN AMIT USED THE POINTS ARRAY,",
    highlight: ["POINTS", "ARRAY"],
  },
  {
    start: 558,
    end: 606,
    text: "THE MATH FLIPPED!",
    highlight: ["MATH", "FLIPPED"],
  },
  {
    start: 606,
    end: 660,
    text: "BY TRANSFERRING THOSE SAME POINTS",
    highlight: ["TRANSFERRING"],
  },
  {
    start: 660,
    end: 705,
    text: "TO AIRLINE PARTNERS,",
    highlight: ["AIRLINE", "PARTNERS"],
  },
  {
    start: 705,
    end: 765,
    text: "LIKE SINGAPORE AIRLINES OR QATAR,",
    highlight: ["SINGAPORE", "QATAR"],
  },
  {
    start: 765,
    end: 820,
    text: "HE BOOKED BUSINESS CLASS TO LONDON!",
    highlight: ["BUSINESS", "CLASS", "LONDON"],
  },

  // Scene 4 (820 to 1139)
  {
    start: 820,
    end: 887,
    text: "THAT IS AN 8X YIELD INCREASE!",
    highlight: ["8X", "YIELD"],
  },
  {
    start: 887,
    end: 974,
    text: "STOP LETTING BANKS PROFIT OFF YOU!",
    highlight: ["STOP", "BANKS", "PROFIT"],
  },
  {
    start: 974,
    end: 1044,
    text: "AMIT DIDN'T GUESS THE YIELD,",
    highlight: ["GUESS", "YIELD"],
  },
  {
    start: 1044,
    end: 1139,
    text: "HE CHECKED IT INSTANTLY!",
    highlight: ["CHECKED", "INSTANTLY"],
  },

  // Scene 5 (1139 to 1515)
  {
    start: 1139,
    end: 1184,
    text: "STOP SWIPING BLIND!",
    highlight: ["STOP", "SWIPING", "BLIND"],
  },
  {
    start: 1184,
    end: 1246,
    text: "START TRAVELING IN BUSINESS CLASS!",
    highlight: ["START", "BUSINESS", "CLASS"],
  },
  {
    start: 1246,
    end: 1314,
    text: "SEARCH 'THE POINTS ARRAY' ON THE APP STORE",
    highlight: ["SEARCH", "POINTS", "ARRAY"],
  },
  {
    start: 1314,
    end: 1369,
    text: "OR CLICK THE LINK IN BIO TO DOWNLOAD!",
    highlight: ["LINK", "BIO", "DOWNLOAD"],
  },
];

const CaptionsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeCaption = CAPTIONS_DATA.find(
    (c) => frame >= c.start && frame < c.end,
  );

  if (!activeCaption) return null;

  const progress = spring({
    frame: frame - activeCaption.start,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 0.2], [0, 1]);

  const words = activeCaption.text.split(" ");

  let topValue = "1350px";
  if (frame >= 1139) {
    topValue = "900px";
  }

  const getHighlightClass = (word: string) => {
    const greenList = [
      "100,000",
      "100000",
      "POINTS",
      "REDEEM",
      "₹25,000",
      "25000",
      "SINGAPORE",
      "QATAR",
      "BUSINESS",
      "CLASS",
      "LONDON",
      "8X",
      "YIELD",
      "CHECKED",
      "INSTANTLY",
      "TRAVELING",
      "DOWNLOAD",
    ];
    const upperWord = word.toUpperCase();
    const isGreen = greenList.some((item) => upperWord.includes(item));
    return isGreen
      ? "text-emerald-400 font-black text-glow-gold"
      : "text-yellow-300 font-black text-glow-gold";
  };

  return (
    <div
      className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none px-8 text-center"
      style={{
        top: topValue,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <p className="m-0 text-white text-7xl font-black tracking-wide uppercase leading-tight select-none font-sans text-stroke-captions">
        {words.map((word, idx) => {
          const cleanWord = word.replace(/[.,#!$^*;:{}=\-_()₹'"?]/g, "");
          const isHighlighted = activeCaption.highlight.some(
            (h) => cleanWord.includes(h) || h.includes(cleanWord),
          );

          return (
            <span
              key={idx}
              className={
                isHighlighted ? getHighlightClass(cleanWord) : "text-white"
              }
              style={{ display: "inline-block", marginRight: "16px" }}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
};

// ==========================================
// MAIN REEL COMPONENT
// ==========================================
export const CatalogTrapReel: React.FC = () => {
  // Timing variables matching composition settings
  const scene1Duration = 253;
  const scene2Duration = 219;
  const scene3Duration = 348;
  const scene4Duration = 319;
  const scene5Duration = 376;

  return (
    <AbsoluteFill className="bg-[#0c0f19] select-none">
      {/* Background Voiceover Audio */}
      <Audio src={staticFile("voiceover.mp3")} />
      {/* Outro Musical Chime Sound Effect */}
      <Sequence from={1360}>
        <Audio src={staticFile("outro_chime.wav")} volume={0.8} />
      </Sequence>
      {/* Sequence 1: The Trap Hook */}
      <Sequence durationInFrames={scene1Duration}>
        <Scene1Hook />
      </Sequence>
      {/* Sequence 2: The Catalog Deception */}
      <Sequence from={scene1Duration} durationInFrames={scene2Duration}>
        <Scene2Problem />
      </Sequence>
      {/* Sequence 3: The Math Flip */}
      <Sequence
        from={scene1Duration + scene2Duration}
        durationInFrames={scene3Duration}
      >
        <Scene3Math />
      </Sequence>
      {/* Sequence 4: The App Dashboard Reveal */}
      <Sequence
        from={scene1Duration + scene2Duration + scene3Duration}
        durationInFrames={scene4Duration}
      >
        <Scene4App />
      </Sequence>
      {/* Sequence 5: Outro / Call to Action */}
      <Sequence
        from={scene1Duration + scene2Duration + scene3Duration + scene4Duration}
        durationInFrames={scene5Duration}
      >
        <Scene5CTA />
      </Sequence>
      {/* Global Captions Overlay */}
      <CaptionsOverlay />
    </AbsoluteFill>
  );
};
