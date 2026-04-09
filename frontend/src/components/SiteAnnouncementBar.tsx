import { Link } from "react-router-dom";

/** True when the fixed top donate strip should render (everywhere except home and admin). */
export function showGlobalSiteAnnouncement(pathname: string): boolean {
  return pathname !== "/" && !pathname.startsWith("/admin");
}

/** Same strip as the landing page: fixed top, above the navbar. */
export function SiteAnnouncementBar() {
  return (
    <div className="announcement-bar">
      <div className="announcement-bar__inner">
        <Link to="/donate" className="announcement-bar__badge">
          DONATE
        </Link>
        <span className="announcement-bar__text">
          100% of every gift goes directly to safe homes and healing for survivors of trafficking.
        </span>
        <Link to="/donate" className="announcement-bar__link">
          Give hope today <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
