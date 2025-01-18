function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to the Home Page</h1>
        <p>Your gateway to exploring the app.</p>
      </header>
      <main className="home-content">
        <section className="features">
          <h2>Features</h2>
          <ul>
            <li>Explore exciting content.</li>
            <li>Learn more about our app.</li>
            <li>Connect with us easily.</li>
          </ul>
        </section>
        <section className="cta">
          <h2>Get Started</h2>
          <p>
            Click on the links in the navigation bar to explore different pages of the app.
          </p>
        </section>
      </main>
    </div>
  )
}

export default Home
