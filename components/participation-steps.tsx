export default function ParticipationSteps() {
  const steps = [
    { number: 1, title: "Choose your city", color: "text-white" },
    { number: 2, title: "Fill out the registration form", color: "text-white" },
    { number: 3, title: "Let's start the quiz fun!", color: "text-white" },
    { number: 4, title: "Check your email / Whatsapp for entry pass (QR Code)", color: "text-white" },
  ]

  return (
    <section className="px-4 py-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
        Register to win Buddy
        <br />
        passes to Drum Tao Live
      </h2>

    <div className="p-[2px]  rounded-[25px] bg-gradient-to-b from-red-500 from-60%  to-81%">
    <div className="rounded-[25px] p-6 sm:p-8 bg-gradient-to-b from-[#222222] to-[#050505]">
    <h2 className="text-2xl sm:text-xl font-bold text-red-500 mb-6">HOW TO PARTICIPATE :</h2>

    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.number} className="flex">
          <div className="text-red-500 text-md font-semibold flex-shrink-0 w-18">STEP {step.number}:</div>
          <p className={`${step.color} text-md sm:text-base leading-relaxed`}>{step.title}</p>
        </div>
      ))}
    </div>
  </div>
</div>

      <p className="text-center text-2xl sm:text-xl font-bold mt-8 ">
        To continue, please
        <br className="sm:hidden" />
        select your city
      </p>
    </section>
  )
}
