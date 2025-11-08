import Image from "next/image";
import { Button } from "./ui/button";

interface CityButtonProps {
  name: string;
  date: string;
  image: string;
  onClick: () => void;
}

// Helper function to get ordinal suffix
function formatDate(dateString: string) {
  const dateObj = new Date(dateString)
  const day = dateObj.getDate()
  const month = dateObj.toLocaleString("default", { month: "short" })
  const year = dateObj.getFullYear()

  // Function to get ordinal (1st, 2nd, 3rd, 4th...)
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  return `${day}${ordinal(day)} ${month} ${year}`
}

export function CityButton({ name, date, image, onClick }: CityButtonProps) {
  return (
    <Button
      variant="ghost" // Removes background and border
      className="h-auto p-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 mb-12" // Removes hover bg
      onClick={onClick}
    >
      <div className="flex flex-col justify-center items-center p-2">
        <Image
          src={image}
          alt={name}
          width={120}
          height={120}
          className="object-cover rounded-xl border border-gray-200 dark:border-gray-700 mb-3" // Added rounded border
        />
        <h2 className="text-lg font-semibold text-center">{name}</h2>
        <p className="text-xs text-white text-center">
          {formatDate(date)}
        </p>

      </div>
    </Button>
  );
}