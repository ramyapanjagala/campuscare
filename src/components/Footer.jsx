function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p>
        &copy; {year} CampusCare – Smart Campus Complaint System &nbsp;|&nbsp; Built with React.js
      </p>
    </footer>
  )
}

export default Footer
