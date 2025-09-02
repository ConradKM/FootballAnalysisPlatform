import Image from "next/image";
import Link from "next/link";

interface MatchCardProps {
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  stadiumName: string;
  date: string;
  href: string;
}

export default function MatchCard({
  homeTeamName,
  homeTeamLogo,
  awayTeamName,
  awayTeamLogo,
  stadiumName,
  date,
  href,
}: MatchCardProps) {
  return (
    <Link href={href}>
      <div className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200 h-full flex flex-col justify-between">
        
        {/* Top: Date & Stadium */}
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-500">{date}</p>
          <p className="text-xs text-gray-400">{stadiumName}</p>
        </div>

        {/* Middle: Teams */}
        <div className="flex items-center justify-between gap-4">
          {/* Home */}
          <div className="flex flex-col items-center w-28 text-center">
            <Image
              src={homeTeamLogo}
              alt={homeTeamName}
              width={60}
              height={60}
              className="object-contain"
            />
            <p className="mt-2 text-sm font-semibold text-gray-800">{homeTeamName}</p>
          </div>

          {/* VS Divider */}
          <div className="text-gray-400 font-bold text-lg">VS</div>

          {/* Away */}
          <div className="flex flex-col items-center w-28 text-center">
            <Image
              src={awayTeamLogo}
              alt={awayTeamName}
              width={60}
              height={60}
              className="object-contain"
            />
            <p className="mt-2 text-sm font-semibold text-gray-800">{awayTeamName}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
