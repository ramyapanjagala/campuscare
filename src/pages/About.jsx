// Only technologies actually used in this project are listed here.
const technologies = [
  { icon: 'Re', color: '#0891b2', name: 'React.js', desc: 'Component-based UI library powering the frontend interface.' },
  { icon: 'No', color: '#16a34a', name: 'Node.js', desc: 'JavaScript runtime that runs the Express backend server.' },
  { icon: 'Ex', color: '#475569', name: 'Express.js', desc: 'Minimal web framework handling all REST API routes.' },
  { icon: '🍃', color: '#059669', name: 'MongoDB Atlas', desc: 'Cloud document database that stores users and complaints.' },
  { icon: 'Mg', color: '#d97706', name: 'Mongoose', desc: 'ODM layer modelling the User and Complaint schemas.' },
  { icon: 'JWT', color: '#e11d48', name: 'JWT', desc: 'Signed tokens for stateless, secure authentication sessions.' },
  { icon: 'bc', color: '#7c3aed', name: 'bcrypt', desc: 'Salted password hashing so plain-text passwords are never stored.' },
  { icon: 'RR', color: '#dc2626', name: 'React Router', desc: 'Client-side routing with role-based protected routes.' },
  { icon: 'Vi', color: '#6d28d9', name: 'Vite', desc: 'Fast dev server and production build tool for the frontend.' },
]

function About() {
  return (
    <div className="page-container">
      <div className="about-page">
        <div className="page-head">
          <h1>About CampusCare</h1>
          <p className="page-subtitle">
            A smart campus complaint system with secure, role-based access for students and
            administrators.
          </p>
        </div>

        <div className="about-section">
          <h2>What is CampusCare?</h2>
          <p>
            CampusCare is a smart campus complaint system designed to help students report problems
            related to classrooms, hostels, cleaning, electricity, water and other campus
            facilities. Students can submit complaints through an easy form and track their
            complaint status in one place, while admins can manage and update every complaint
            across the campus.
          </p>
        </div>

        <div className="about-section">
          <h2>Authentication &amp; Roles</h2>
          <p>
            CampusCare includes a secure login system with two roles. Students can register
            themselves and submit complaints, viewing only their own submissions. Admins are
            created securely by the administrator (never through public registration) and can view,
            search, filter and update the status of all complaints. Passwords are hashed with
            bcrypt, sessions are handled with JWT tokens, and protected routes are enforced on
            both the frontend and backend.
          </p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <p>
            Students sign in and are redirected to their personal dashboard showing their complaint
            statistics and history. From there they can submit new complaints, which are sent to
            the <strong>Node.js + Express</strong> backend and stored in{' '}
            <strong>MongoDB</strong>. Admins sign in to the admin dashboard, where they can search
            and filter every complaint and update its status (Pending, In Progress or Resolved).
            Status changes are saved to the database and instantly reflected on each student's
            dashboard.
          </p>
        </div>

        <div className="about-section">
          <h2>Technologies Used</h2>
          <p className="about-section-intro">
            The full stack powering CampusCare — every tool below is actively used in the project.
          </p>
          <div className="tech-grid">
            {technologies.map((tech) => (
              <div className="tech-card" key={tech.name}>
                <div
                  className="tech-icon"
                  style={{ color: tech.color, borderColor: tech.color }}
                >
                  {tech.icon}
                </div>
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section about-team">
          <h2>Project Info</h2>
          <p>
            This project demonstrates React components, React Router, context-based state, form
            validation, secure REST API integration with Express.js, JWT authentication,
            role-based authorization and a MongoDB database — built as a complete MERN stack
            application.
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
