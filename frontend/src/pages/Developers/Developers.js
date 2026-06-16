import React from "react";
import "./Developers.css";

const developers = [
  {
    id: 1,
    name: "TSNV Raviteja",
    role: "CS Student",
    image: "https://res.cloudinary.com/dys0jbwg1/image/upload/v1781621454/WhatsAppImage2026-03-28at6.25.44PM_qgeqgo.jpg",
    bio: "Computer Science undergraduate at NIT Andhra Pradesh with interests in full-stack development, computer vision, and machine learning. Focused on developing scalable applications and applying modern technologies to create practical and impactful solutions.",
    github: "https://github.com/RAVITEJA12158",
    linkedin: "https://www.linkedin.com/in/raviteja-tsnv-9352b7329/",
    email: "tsnvraviteja@gmail.com",
    portfolio: "#"
  },
  {
    id: 2,
    name: "Shreetheja Vasala",
    role: "CS Student",
    image: "https://i.ibb.co/gZb7wCZ9/Whats-App-Image-2026-06-16-at-11-59-12-AM.jpg",
    bio: "A CS Student passionate about full-stack development and creating intuitive user experiences. Dedicated to learning and implementing modern web technologies to solve real-world problems.",
    github: "https://github.com/Shreetheja0712",
    linkedin: "https://www.linkedin.com/in/shreetheja-vasala-3b7b8b360/",
    email: "shreeteja.vasala@gmail.com",
    portfolio: "#"
  },

];

function Developers() {
  return (
    <div className="developers-page">
      <div className="developers-header">
        <h1>Meet the <span>Developers</span></h1>
        <p>The creative minds behind ShopMasti, turning ideas into reality with cutting-edge technology and design.</p>
      </div>

      <div className="developers-grid">
        {developers.map(dev => (
          <div className="dev-card" key={dev.id}>
            <div className="dev-image-wrapper">
              <img src={dev.image} alt={dev.name} className="dev-image" />
              <div className="dev-overlay">
                <div className="dev-socials">
                  <a href={dev.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i></a>
                  <a href={dev.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
                  <a href={`mailto:${dev.email}`} aria-label="Email"><i className="fas fa-envelope"></i></a>
                  {/* <a href={dev.portfolio} aria-label="Portfolio" target="_blank" rel="noopener noreferrer"><i className="fas fa-globe"></i></a> */}
                </div>
              </div>
            </div>
            <div className="dev-info">
              <h3>{dev.name}</h3>
              <span className="dev-role">{dev.role}</span>
              <p className="dev-bio">{dev.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Developers;
