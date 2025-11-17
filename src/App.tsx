import { LandingPage } from "./components/landing-page";

function App() {
  return (
    <div className="App">
      <LandingPage
        introVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
        desktopBackgroundVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117114/1103_2_yfa7mp.mp4"
        mobileBackgroundVideoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763117120/1103_3_pexbu3.mp4"
        autoPlay={true}
      />
    </div>
  );
}

export default App;