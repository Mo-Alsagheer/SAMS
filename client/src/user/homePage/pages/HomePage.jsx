import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";
import HeroSection from "../components/HeroSection";
import Cards from "../../../components/shared/Cards";
import CommitteesSection from "../components/CommiteesSection";
import StatsSection from "../components/StatsSection";
import AboutUs from "../components/AboutUs";
function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutUs/>
        <StatsSection/>
      <CommitteesSection />
    
      <Footer/>
    </div>
  );
}
export default HomePage;
