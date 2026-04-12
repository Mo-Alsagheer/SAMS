import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";
import HeroSection from "../components/HeroSection";
import CommitteesSection from "../components/CommiteesSection";
import StatsSection from "../components/StatsSection";
import AboutUs from "../components/AboutUs";
import LastSection from "../components/LastSection";

function HomePage() {
  return (
    <div>
      <Navbar />

      <section id="home">
        <HeroSection />
      </section>

      <section id="about">
        <AboutUs />
      </section>

      <section id="stats">
        <StatsSection />
      </section>

      <section id="committees">
        <CommitteesSection />
      </section>

      <section id="last">
        <LastSection />
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;