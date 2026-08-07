import './index.scss'

export type HubSectionCard = {
  title: string
  description: string
  meta: string
}

type HubSectionProps = {
  eyebrow: string
  title: string
  description: string
  cards: HubSectionCard[]
  footer: string
}

function HubSection({ eyebrow, title, description, cards, footer }: HubSectionProps) {
  return (
    <section className="hub-section-page">
      <div className="hub-section-page__intro">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="hub-section-page__grid">
        {cards.map((card) => (
          <article className="hub-section-card" key={card.title}>
            <small>{card.meta}</small>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </div>

      <div className="hub-section-page__footer">
        <p>{footer}</p>
      </div>
    </section>
  )
}

export default HubSection
