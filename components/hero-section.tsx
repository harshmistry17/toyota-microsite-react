import Image from "next/image"

export default function HeroSection() {
  return (
    <div className="relative w-full h-128 sm:h-80 md:h-96 overflow-hidden">
      <Image
        src="/ui/page1.png"
        alt="Drum Tao Beat - Drums and Cars"
        fill
        className="object-cover"
        priority
      />
    </div>
  )
}
