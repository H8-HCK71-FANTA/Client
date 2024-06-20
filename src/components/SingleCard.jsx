import "../components/SIngleCard.css";

export default function SingleCard({
  card,
  handleChoice,
  flipped,
  disabled,
  test,
}) {
  const handleClick = () => {
    if (!disabled) {
      handleChoice(card);
    }
  };

  return (
    <div className="card" key={test}>
      <div className={flipped ? "flipped" : ""}>
        <img className="front" src={card.src} alt="card front" />
        <img
          className="back"
          src="/img/background.jpg"
          onClick={handleClick}
          alt="card back"
        />
      </div>
    </div>
  );
}
