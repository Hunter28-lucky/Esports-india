import Script from "next/script"

interface TournamentSchemaProps {
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  prizePool: number
  entryFee: number
  maxParticipants: number
  currentParticipants: number
  game: string
}

export function TournamentSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  prizePool,
  entryFee,
  maxParticipants,
  currentParticipants,
  game,
}: TournamentSchemaProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: name,
    description: description,
    startDate: startDate,
    endDate: endDate,
    location: {
      "@type": "VirtualLocation",
      name: location,
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    organizer: {
      "@type": "Organization",
      name: "GameArena Pro",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    sport: {
      "@type": "Thing",
      name: game,
    },
    offers: {
      "@type": "Offer",
      price: entryFee,
      priceCurrency: "INR",
      availability:
        currentParticipants < maxParticipants ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    maximumAttendeeCapacity: maxParticipants,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    award: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: prizePool,
    },
  }

  return (
    <Script
      id={`tournament-schema-${name.replace(/\s+/g, "-").toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GameArena Pro",
    description: "India's premier esports tournament platform for competitive gaming",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/free-fire-championship-tournament-esports.jpg`,
    sameAs: [
      "https://twitter.com/GameArenaPro",
      "https://facebook.com/GameArenaPro",
      "https://instagram.com/GameArenaPro",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@gamearena-pro.com",
    },
    areaServed: "IN",
    knowsAbout: ["esports", "gaming tournaments", "Free Fire", "BGMI", "PUBG Mobile", "Valorant", "competitive gaming"],
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function FAQSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I join a Free Fire tournament?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To join a Free Fire tournament, create an account on GameArena Pro, add money to your wallet, browse available tournaments, and click 'Join Battle' on your preferred tournament. Make sure you have sufficient balance for the entry fee.",
        },
      },
      {
        "@type": "Question",
        name: "Can I earn money playing BGMI tournaments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! GameArena Pro offers cash prizes for BGMI tournaments. Winners receive prize money directly to their wallet, which can be withdrawn to their bank account. Prize pools range from ₹1,000 to ₹50,000+ depending on the tournament.",
        },
      },
      {
        "@type": "Question",
        name: "What games are available for tournaments?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "GameArena Pro hosts tournaments for popular games including Free Fire, BGMI (Battlegrounds Mobile India), PUBG Mobile, Valorant, and other competitive esports titles. New games are added regularly based on community demand.",
        },
      },
      {
        "@type": "Question",
        name: "How do I add money to my wallet?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the 'Add Money' button in the header, select your preferred amount, and complete the payment using UPI, debit card, or net banking. Money is added instantly to your wallet after successful payment verification.",
        },
      },
      {
        "@type": "Question",
        name: "Are the tournaments safe and fair?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all tournaments on GameArena Pro are monitored for fair play. We use anti-cheat systems, manual review processes, and have strict rules against cheating. All prize distributions are automated and transparent.",
        },
      },
    ],
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteSchema() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GameArena Pro",
    description: "India's premier esports tournament platform",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
