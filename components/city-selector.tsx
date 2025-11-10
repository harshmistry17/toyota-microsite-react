// "use client"

// import CityButton from "./city-button"

// interface CitySelectorProps {
//   onCitySelect: (city: string) => void
// }

// export default function CitySelector({ onCitySelect }: CitySelectorProps) {
//   const cities = [
//     {
//       name: "Chennai",
//       date: "20th Nov, 2025",
//       image: "/ui/city1.png",
//     },
//     {
//       name: "Vijayawada",
//       date: "18th Nov, 2025",
//       image: "/ui/city2.png",
//     },
//     {
//       name: "Bengaluru",
//       date: "20th Dec, 2025",
//       image: "/ui/city3.png",
//     },
//     {
//       name: "Delhi",
//       date: "20th Nov, 2025",
//       image: "/ui/city4.png",
//     },
//     {
//       name: "Jaipur",
//       date: "3rd Nov, 2025",
//       image: "/ui/city5.png",
//     },
//     {
//       name: "Varanasi",
//       date: "3rd Nov, 2025",
//       image: "/ui/city6.png",
//     },
//   ]

//   return (
//     <section className="px-4 py-8 sm:px-6 md:px-8 max-w-6xl mx-auto">
//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
//         {cities.map((city) => (
//           <CityButton key={city.name} city={city} onClick={() => onCitySelect(city.name)} />
//         ))}
//       </div>
//     </section>
//   )
// }

// Toyota/components/city-selector.tsx

// "use client";
// import { CityButton } from "./city-button";

// // Updated to use images from /cover/
// const cities = [
//   { name: "Bengaluru", date: "15th Nov, 2025", image: "/cover/bengaluru.png" },
//   { name: "Chennai", date: "16th Nov, 2025", image: "/cover/chennai.png" },
//   { name: "Delhi", date: "17th Nov, 2025", image: "/cover/delhi.png" },
//   { name: "Jaipur", date: "18th Nov, 2025", image: "/cover/jaipur.png" },
//   { name: "Varanasi", date: "19th Nov, 2025", image: "/cover/varanasi.png" },
//   { name: "Vijayawada", date: "20th Nov, 2025", image: "/cover/vijayawada.png" },
// ];

// export function CitySelector({
//   onSelectCity,
// }: {
//   onSelectCity: (city: { name: string; date: string; image: string }) => void;
// }) {
//   return (
//     <div className="flex flex-col items-center justify-center p-4">
//       <h1 className="text-2xl font-bold text-center mb-8">
//         Select your city to begin
//       </h1>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//         {cities.map((city) => (
//           <CityButton
//             key={city.name}
//             name={city.name}
//             date={city.date}
//             image={city.image}
//             onClick={() => onSelectCity(city)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }


"use client"

import {CityButton} from "@/components/city-button"
import type { CityConfig } from "@/lib/types"

interface CitySelectorProps {
  cities: CityConfig[] // Use the CityConfig type
  onCitySelect: (city: string) => void
}

export default function CitySelector({ cities, onCitySelect }: CitySelectorProps) {
  return (
    <div id="cities">
      <div className="flex flex-wrap justify-center gap-6">
        {cities.map((city) => (
          <CityButton
            key={city.id}
            name={city.city_name}
            date={city.event_date}
            image={`/cityicon/${city.city_name}.png`} // ✅ Add this line
            onClick={() => onCitySelect(city.city_name)}
          />
        ))}
      </div>
    </div>
  )
}