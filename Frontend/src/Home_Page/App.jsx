import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./app.css";

// Loading screen timings (milliseconds)
const MIN_LOADING_MS = 2000; // loader never flashes away faster than this
const MAX_LOADING_MS = 12000; // safety: never get stuck on the loader

// Hero: after the video starts, the title moves left and the panel slides in
const PANEL_AT_MS = 6500;

// Pinned section: how far (in screen heights) you scroll before the white box zoom
const GO_TO_TRACK = 0.25;
const BACK_MARGIN = 0.1; // small gap so it doesn't flicker when scrolling back

// How long each change takes (milliseconds)
const BOX_ZOOM_MS = 2000;
const BACK_MS = 1500;

function Home_Page() {
  const videoRef = useRef(null);
  const aboutRef = useRef(null);
  const stageRef = useRef(null);
  const footerRef = useRef(null);
  const stepRef = useRef(0); // step currently shown
  const targetRef = useRef(0); // step the scroll position asks for
  const busyRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading"); // "loading" -> "hero"
  const [leaving, setLeaving] = useState(false); // loader fading out
  const [loaderGone, setLoaderGone] = useState(false);
  const [scene2, setScene2] = useState(false); // title moved left + panel in
  const [aboutVisible, setAboutVisible] = useState(false);
  const [footerIn, setFooterIn] = useState(false);
  const [view, setView] = useState({ step: 0, dir: "back", anim: "" });

  // 1) Loading screen: waits for the page AND the video to be ready
  useEffect(() => {
    let pageReady = document.readyState === "complete";
    let videoReady = false;
    let minDone = false;
    let finished = false;
    const timers = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      timers.push(
        setTimeout(() => {
          setLeaving(true);
          setPhase("hero");
        }, 500)
      );
    };

    const check = () => {
      if (pageReady && videoReady && minDone) finish();
    };

    const onPageLoad = () => {
      pageReady = true;
      check();
    };
    if (!pageReady) window.addEventListener("load", onPageLoad);

    const video = videoRef.current;
    const onVideoReady = () => {
      videoReady = true;
      check();
    };
    if (video) {
      if (video.readyState >= 4) {
        videoReady = true;
      } else {
        video.addEventListener("canplaythrough", onVideoReady);
        video.addEventListener("error", onVideoReady); // don't hang if video fails
      }
    }

    timers.push(
      setTimeout(() => {
        minDone = true;
        check();
      }, MIN_LOADING_MS)
    );
    timers.push(setTimeout(finish, MAX_LOADING_MS));

    // Progress line creeps toward 90% while loading, jumps to 100% when ready
    const creep = setInterval(() => {
      setProgress((p) => (finished ? p : p + (90 - p) * 0.06));
    }, 120);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(creep);
      window.removeEventListener("load", onPageLoad);
      if (video) {
        video.removeEventListener("canplaythrough", onVideoReady);
        video.removeEventListener("error", onVideoReady);
      }
    };
  }, []);

  // 2) Remove the loader from the page once it has faded out
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setLoaderGone(true), 1000);
    return () => clearTimeout(t);
  }, [leaving]);

  // 3) Hero: play the video (keeps rolling), then title moves left + panel slides in
  useEffect(() => {
    if (phase !== "hero") return;
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    const t = setTimeout(() => setScene2(true), PANEL_AT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // 4) "What do we do?" fades in when scrolled into view
  useEffect(() => {
    const el = aboutRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 5) Pinned section: one scroll = the white box zoom to "Track Your Fleet"
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    let timer = 0;

    const play = () => {
      if (busyRef.current) return;
      const cur = stepRef.current;
      const target = targetRef.current;
      if (cur === target) return;

      const forward = target > cur;
      const next = forward ? 1 : 0;
      busyRef.current = true;
      stepRef.current = next;
      setView({
        step: next,
        dir: forward ? "fwd" : "back",
        anim: forward ? "box" : "",
      });

      timer = setTimeout(() => {
        busyRef.current = false;
        setView((v) => ({ ...v, anim: "" }));
        play(); // continue if the scroll has moved on meanwhile
      }, forward ? BOX_ZOOM_MS : BACK_MS);
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const offset = -stage.getBoundingClientRect().top;
      let t = targetRef.current;
      if (t === 0 && offset >= vh * GO_TO_TRACK) t = 1;
      else if (t === 1 && offset < vh * (GO_TO_TRACK - BACK_MARGIN)) t = 0;
      targetRef.current = t;
      play();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(timer);
      busyRef.current = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 6) Footer slides in from both sides when scrolled into view
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFooterIn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {!loaderGone && (
        <div
          className={`loader ${leaving ? "loader--leaving" : ""}`}
          role="status"
          aria-label="Loading"
        >
          <p className="loader__tagline">Connecting continents</p>
          <div className="loader__center">
            <img
              className="loader__logo"
              src="/Homepage/logo_ww.png"
              alt="Ocean Bridge"
            />
            <div className="loader__track">
              <div className="loader__bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <main className="home">
        {/* Hero: video + title, then a sliding panel with the intro content */}
        <section className={`hero ${scene2 ? "hero--scene2" : ""}`}>
          <div className="hero__media">
            <video
              ref={videoRef}
              className="hero__video"
              src="/Homepage/bg.mp4"
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          </div>

          <div className="hero__panel" aria-hidden="true" />

          <img
            className="hero__item hero__logo"
            style={{ "--d": "2.5s" }}
            src="/Homepage/logo_ww.png"
            alt="Ocean Bridge"
          />

          <h1
            className={`hero__title ${
              phase === "hero" ? "hero__title--play" : ""
            }`}
          >
            <span className="hero__line hero__line--bold">Beyond Borders</span>
            <span className="hero__line hero__line--light">Across Oceans</span>
          </h1>

          <p className="hero__item hero__para" style={{ "--d": "2.8s" }}>
            From local ports to international destinations, OceanBridge keeps
            global trade moving through reliable shipping, smarter fleet
            management and seamless maritime logistics.
          </p>

          <Link
            to="/signup"
            className="hero__item hero__cta"
            style={{ "--d": "3.1s" }}
          >
            Ship With Us
          </Link>

          <p className="hero__item hero__tag" style={{ "--d": "3.4s" }}>
            Delivering
            <br />
            Possibilities
          </p>
        </section>

        {/* What do we do? */}
        <section
          ref={aboutRef}
          className={`about ${aboutVisible ? "about--visible" : ""}`}
        >
          <h2 className="about__title">What do we do?</h2>
          <p className="about__text">
            At OceanBridge, we make global shipping simpler, smarter, and more
            connected. From managing vessels and monitoring voyages to
            coordinating cargo and tracking shipments, we bring every aspect of
            maritime logistics together on one platform. Our goal is to connect
            ports, businesses, and continents through reliable shipping
            operations and seamless global trade.
          </p>
        </section>

        {/* Pinned section: Company Registration, then the white box zoom */}
        <section
          ref={stageRef}
          className="stage"
          data-step={view.step}
          data-dir={view.dir}
          data-anim={view.anim}
        >
          <div className="stage__viewport">
            {/* Page 1: Company Registration */}
            <div className="slide slide--reg">
              <span className="count count--left">01/02</span>

              <img
                className="photo-back"
                src="/Homepage/second_back.jpg"
                alt="Cargo ship at sea"
              />
              <img
                className="photo-front"
                src="/Homepage/second_front.jpg"
                alt="Stack of shipping documents"
              />

              <div className="reg">
                <h2 className="reg__title">Company Registration</h2>
                <p className="reg__text">
                  Add a vessel to the OceanBridge fleet by providing its
                  identification, technical specifications, and registration
                  details. Once registered, it can be managed and assigned to
                  eligible voyages.
                </p>
                <p className="reg__login">
                  Already registered? <Link to="/login">Log in</Link>
                </p>
                {/* Only the white box grows; the text stays its size */}
                <Link to="/signup" className="reg__button">
                  <span className="reg__box" />
                  <span className="reg__label">Start Your Journey</span>
                </Link>
              </div>
            </div>

            {/* Page 2: Track Your Fleet */}
            <div className="slide slide--track">
              <img
                className="dash-back s4 s4--left"
                src="/Homepage/dash_back.jpg"
                alt="Cargo ship and port"
              />
              <img
                className="dash-front s4 s4--left"
                src="/Homepage/dash_front.jpg"
                alt="Inside a ship's control room"
              />
              <span className="count count--right s4 s4--right">02/02</span>
              <h2 className="dash__title s4 s4--right">Track Your Fleet</h2>
              <a className="dash__button s4 s4--right" href="#">
                Visit Dashboard
              </a>
              <p className="dash__text s4 s4--right">
                Monitor vessel positions, follow voyage routes, and access
                real-time operational updates from one centralized tracking
                interface.
              </p>
            </div>
          </div>
        </section>

        {/* Footer: the two halves slide in from the sides */}
        <footer
          ref={footerRef}
          className={`footer ${footerIn ? "footer--in" : ""}`}
        >
          <div className="footer__left">
            <div className="footer__cols">
              <div>
                <h3 className="footer__heading">Platform</h3>
                <ul className="footer__list">
                  <li><a href="#">Vessel Tracking</a></li>
                  <li><a href="#">Voyage Management</a></li>
                  <li><a href="#">Shipment Tracking</a></li>
                  <li><a href="#">Fleet Overview</a></li>
                </ul>
              </div>
              <div>
                <h3 className="footer__heading">Operations</h3>
                <ul className="footer__list">
                  <li><a href="#">Vessel Registry</a></li>
                  <li><a href="#">Port Directory</a></li>
                  <li><a href="#">Cargo Management</a></li>
                  <li><a href="#">Maintenance Records</a></li>
                </ul>
              </div>
            </div>

            <img
              className="footer__logo"
              src="/Homepage/logo_bb.png"
              alt="Ocean Bridge"
            />
            <p className="footer__copy">
              2026 OceanBridge. All Rights Reserved
            </p>
          </div>

          <div className="footer__right">
            <div className="footer__cols">
              <div>
                <h3 className="footer__heading">Company</h3>
                <ul className="footer__list">
                  <li><a href="#">About OceanBridge</a></li>
                  <li><a href="#">Our Network</a></li>
                  <li><a href="#">Contact Operations</a></li>
                </ul>
              </div>
              <div>
                <h3 className="footer__heading">Resources</h3>
                <ul className="footer__list">
                  <li><a href="#">Help &amp; Support</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Security</a></li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="footer__heading">Newsletter</h3>
              <p className="footer__text">
                Get the latest maritime insights, shipping updates and company
                news delivered to your inbox.
              </p>
              <form
                className="footer__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: connect newsletter sign up
                }}
              >
                <input
                  type="email"
                  aria-label="Email address"
                  className="footer__input"
                  required
                />
                <button type="submit" className="footer__subscribe">
                  Subscribe
                </button>
              </form>
            </div>

            <div>
              <h3 className="footer__heading">Get In Touch</h3>
              <p className="footer__text footer__contact">
                contact@oceanbridge.org
                <br />
                +880 1812-4446789
                <br />
                Gulshan-2, Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

export default Home_Page;