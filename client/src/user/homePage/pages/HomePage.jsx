import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";
import HeroSection from "../components/HeroSection";
import Cards from "../components/Cards";
import StatsSection from "../components/StatsSection";
import AboutUs from "../components/AboutUs";
import LastSection from "../components/LastSection";
function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutUs />
      <StatsSection />
      <Cards />
      <LastSection />
      <Footer />
    </div>
  );
}
export default HomePage;
