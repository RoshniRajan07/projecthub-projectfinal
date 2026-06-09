import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

import {
  Upload,
  Award,
  BookOpen,
  Users,
  BarChart3,
  Globe,
  FileText,
  CheckCircle
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const trackLandingClick = (action) => {
    fetch(`http://localhost:8081/landing/click?action=${encodeURIComponent(action)}`)
      .catch(() => {});
  };

  const scrollToSection = (id) => {
    trackLandingClick(id);
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };

  const goToLogin = (action) => {
    trackLandingClick(action);
    navigate("/login");
  };

  return (
    <div className="home">

      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">
          <div className="logo-box">🎓</div>
          <span>ProjectHub+</span>
        </div>

        <ul className="nav-links">
          <li onClick={() => scrollToSection("features")}>Features</li>
          <li onClick={() => scrollToSection("how")}>How It Works</li>
          <li onClick={() => scrollToSection("testimonials")}>Testimonials</li>
        </ul>

        {/* ✅ NAVIGATE TO LOGIN */}
        <button className="signin" onClick={() => goToLogin("sign-in")}>
          Sign In
        </button>
      </div>

      {/* HERO */}
      <div className="hero">
        <h1>
          Your Academic Projects,<br />
          <span>Simplified</span>
        </h1>

        <p>
          A unified portal for student project submissions, certificate verification,
          faculty reviews, and professional portfolio management.
        </p>

        <div className="btn-group">
          {/* ✅ NAVIGATE TO LOGIN */}
          <button className="btn-primary" onClick={() => goToLogin("get-started")}>
            Get Started →
          </button>

          {/* SCROLL */}
          <button
            className="btn-secondary"
            onClick={() => scrollToSection("features")}
          >
            Explore Features
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div>
          <h2>5,000+</h2>
          <p>Projects Submitted</p>
        </div>
        <div>
          <h2>1,200+</h2>
          <p>Students Active</p>
        </div>
        <div>
          <h2>98%</h2>
          <p>Approval Rate</p>
        </div>
        <div>
          <h2>150+</h2>
          <p>Faculty Members</p>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="features-section">
        <h2>
          Everything You Need, <span>In One Place</span>
        </h2>

        <p>
          Built for students, faculty, and administrators to manage the entire academic project lifecycle.
        </p>

        <div className="feature-grid">

          <div className="card">
            <div className="icon-box"><Upload size={26} /></div>
            <h3>Project Submission</h3>
            <p>Submit projects with documents, source code, and presentations.</p>
          </div>

          <div className="card">
            <div className="icon-box"><Award size={26} /></div>
            <h3>Certificate Management</h3>
            <p>Upload and verify academic certificates with automated workflows.</p>
          </div>

          <div className="card">
            <div className="icon-box"><BookOpen size={26} /></div>
            <h3>Faculty Review</h3>
            <p>Structured grading with feedback and resubmission tracking.</p>
          </div>

          <div className="card">
            <div className="icon-box"><Users size={26} /></div>
            <h3>User Management</h3>
            <p>Role-based access for students, faculty, and admins.</p>
          </div>

          <div className="card">
            <div className="icon-box"><BarChart3 size={26} /></div>
            <h3>Analytics Dashboard</h3>
            <p>Real-time insights on submissions and performance.</p>
          </div>

          <div className="card">
            <div className="icon-box"><Globe size={26} /></div>
            <h3>Profile Integration</h3>
            <p>Link GitHub, LinkedIn, and coding profiles.</p>
          </div>

        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" className="how-section">
        <h2>
          How It <span>Works</span>
        </h2>

        <div className="steps">

          <div className="step">
            <div className="circle">
              <FileText size={26} />
              <div className="step-no">01</div>
            </div>
            <h3>Submit</h3>
            <p>Students upload projects with documents, code, and presentations.</p>
          </div>

          <div className="step">
            <div className="circle">
              <CheckCircle size={26} />
              <div className="step-no">02</div>
            </div>
            <h3>Review</h3>
            <p>Faculty review submissions, provide grades, and feedback.</p>
          </div>

          <div className="step">
            <div className="circle">
              <Award size={26} />
              <div className="step-no">03</div>
            </div>
            <h3>Certify</h3>
            <p>Approved projects get certified.</p>
          </div>

        </div>
      </div>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="testimonials-section">
        <h2>
          What Users <span>Say</span>
        </h2>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"ProjectHub+ streamlined my entire submission process."</p>
            <h4>Priya Sharma</h4>
            <span>B.Tech Student</span>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"Faculty review dashboard saves hours of work."</p>
            <h4>Dr. Rajesh Kumar</h4>
            <span>Associate Professor</span>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p>"Managing 500+ students is effortless now."</p>
            <h4>Anita Desai</h4>
            <span>Department Admin</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-left">
          <div className="logo">
            <div className="logo-box">🎓</div>
            <span>ProjectHub+</span>
          </div>
        </div>

        <div className="footer-right">
          © 2026 ProjectHub+. All rights reserved.
        </div>
      </div>

    </div>
  );
}
