"use client"


interface TermsConditionsPageProps {
  onBack: () => void
}

export default function TermsConditionsPage({ onBack }: TermsConditionsPageProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      <div className="relative">
        <img
            src="/ui/page2.png"
            alt="Drum Tao"
            className="w-full h-auto max-h-64 object-cover"
          />
        
        {/* Back Button (Icon-only, positioned over image) */}
        {/* <button 
          onClick={onBack} 
          className="absolute top-4 left-4 z-10 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button> */}
      </div>

      {/* T&C Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-12">Terms & Conditions</h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">Entry & Registration</h2>
            <p className="leading-relaxed  text-sm">
              Entry is permitted only with a valid QR code or ticket issued by the organizers. Each QR code/ticket
              admits the number of persons specified on it. Attendees must carry a valid government-issued photo ID for
              verification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">QR Code Policy</h2>
            <p className="leading-relaxed  text-sm">
              Do not share your QR code/ticket with anyone. Once scanned, it cannot be reused. The organizers are not
              responsible for lost, stolen, or misused QR codes/tickets. Entry will be granted only to the first person
              who scans the valid code.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">Wristband Collection</h2>
            <p className="leading-relaxed  text-sm">
              Wristbands must be collected from the designated box office before entry. Wristbands are non-transferable
              and must be worn at all times inside the venue. Damaged or lost wristbands will not be replaced.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">Event Guidelines</h2>
            <p className="leading-relaxed  text-sm">
              The organizers reserve the right to deny entry or remove any attendee for inappropriate behavior,
              intoxication, or violation of venue rules. Outside food, beverages, alcohol, drugs, weapons, and hazardous
              items are strictly prohibited. Professional cameras, audio/video recording devices, and drones are not
              allowed unless approved.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">Safety & Liability</h2>
            <p className="leading-relaxed  text-sm">
              Attendees are responsible for their personal belongings. The organizers are not liable for any loss,
              theft, or injury. In case of an emergency, please follow the instructions of the event staff and security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">Event Changes</h2>
            <p className="leading-relaxed  text-sm">
              The event schedule, lineup, or venue is subject to change without prior notice. In case of postponement,
              cancellation, or rescheduling, the organizers will communicate the refund or rescheduling policy as
              applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3">Consent</h2>
            <p className="leading-relaxed text-sm">
              By attending the concert, you consent to being photographed or recorded for promotional purposes. 
              <br/><br/>Each city has limited passes for the concert. Distribution or allocation of the passes is at the discretion of
              the organizer. Registrations for the concert, for each city, will close once all available passes for each
              city have been allotted.
            </p>
          </section>

          <button
            onClick={onBack} 
            className="w-full bg-red-600 text-white uppercase py-4 text-lg hover:bg-red-700 transition-colors disabled:bg-gray-500"
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  )
}