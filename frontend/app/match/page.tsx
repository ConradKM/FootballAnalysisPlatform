import MatchCardList from "./components/MatchCardList";
import FadeContent from '../components/FadeContent';
// Make Home an async server component
export default async function Home() {
  // Replace with your FastAPI backend URL
  const res = await fetch("http://localhost:8000/matches/1", {
    cache: "no-store", // always get fresh data
  });

  const matches = await res.json();

  return (
    <div>
        <FadeContent blur={false} duration={1000} easing="ease-out" initialOpacity={0}>
            <MatchCardList
            title="Premier League"
            matches={matches}
            />
        </FadeContent>
      
    </div>
  );
}
