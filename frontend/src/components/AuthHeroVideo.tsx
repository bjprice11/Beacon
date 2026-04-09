/** Full-bleed muted loop for login / register (overlay covers load; no poster flash). */
export function AuthHeroVideo() {
  return (
    <div className="auth-hero-video" aria-hidden="true">
      <video
        className="auth-hero-video__media"
        src="/donor_dash_background.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="auth-hero-video__overlay" />
    </div>
  );
}
