import { LandingPage } from "./components/landing-page";

function App() {
  return (
    <div className="App">
      <LandingPage
        videoUrl="https://res.cloudinary.com/djg0pqts6/video/upload/v1763329342/1114_2_z4csev.mp4"
        autoPlay={true}
      />
    </div>
  );
}

export default App;