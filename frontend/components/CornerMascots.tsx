// Place chog.png and molandak.png inside the `public/` folder at the
// project root (frontend/public/chog.png, frontend/public/molandak.png).
// Anything in `public/` is served from the site root, so "/chog.png" just
// works — no import needed.

export function CornerMascots() {
  return (
    <>
      <img
        src="/chog.png"
        alt="Chog"
        className="hidden lg:block fixed bottom-0 -left-14 w-24 h-24 md:w-[400px] md:h-[300px] object-contain pointer-events-none select-none z-10"
      />
      <img
        src="/molandak.png"
        alt="Molandak"
        className="hidden lg:block fixed -bottom-12 -right-14 w-24 h-24 md:w-[400px] md:h-[300px] object-contain pointer-events-none select-none z-10"
      />
    </>
  );
}
