import { LandingPage } from "./components/landing-page";

function App() {
  return (
    <div className="App">
      <LandingPage
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763122736/kling_20251114_Image_to_Video_an_animate_5015_2_d1ayqf.mp4"
        autoPlay={true}
      />
    </div>
  );
}

export default App;