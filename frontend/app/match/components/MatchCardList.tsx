import MatchCard from "./MatchCard";

interface Match {
  id: number;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  date: string;
  stadiumName: string;
  href: string;
}

interface MatchCardListProps {
  title: string;
  matches: Match[];
}

export default function MatchCardList({ title, matches }: MatchCardListProps) {
  return (
    <section className="px-6 py-10 bg-gray-50">
      {/* Section Title */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        {title}
      </h2>

      {/* Flexbox Grid for Auto-Balancing */}
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
        {matches.map((match) => (
          <div
            key={match.id}
            className="flex-grow sm:flex-grow-0 sm:basis-[45%] lg:basis-[30%] max-w-sm"
          >
            <MatchCard
              homeTeamName={match.homeTeamName}
              homeTeamLogo={match.homeTeamLogo}
              awayTeamName={match.awayTeamName}
              awayTeamLogo={match.awayTeamLogo}
              stadiumName={match.stadiumName}
              date={match.date}
              href={match.href}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
