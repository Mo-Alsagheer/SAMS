import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";
import HeroSection from "../components/HeroSection";
import Cards from "../components/Cards";
import StatsSection from "../components/StatsSection";
import AboutUs from "../components/AboutUs";
import LastSection from "../components/LastSection";
import ExecutiveSection from "../components/ExecutiveSection";
function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutUs />
      <ExecutiveSection/>
      <StatsSection />
      <Cards />
      <LastSection />
      <Footer />
    </div>
  );
}
export default HomePage;
