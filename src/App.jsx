import { useState, useEffect } from "react";
import "./App.css";
import { useSocket } from "./hooks/useSocket";
import { Button, Label, TextInput } from "flowbite-react";
import SingleCard from "./components/SingleCard";

export default function App() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [userName, setUserName] = useState("");
  const [isUserSet, setIsUserSet] = useState(false);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sen, setSen] = useState("");

  const socket = useSocket();

  const handleChoice = (card) => {
    if (disabled || card === choiceOne || card === choiceTwo) return;
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);

      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true };
            } else {
              return card;
            }
          });
        });

        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  useEffect(() => {
    let count = 0;

    cards.forEach((card) => {
      if (card.matched === true) {
        count++;
      }
    });

    if (cards.length === count) {
      alert("Success! You matched all the cards.");
    }
  }, [cards]);

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };

  useEffect(() => {
    socket?.on("messages", (data) => {
      setMessages(data);
    });

    socket?.on("game-board-created", (cards) => {
      console.log(cards, "masuk harusnya");
      setCards(cards);
      setTurns(0);
      setChoiceOne(null);
      setChoiceTwo(null);
    });

    socket?.on("user-joined", (userName, players) => {
      console.log(`${userName} bergabung kedalam room.`);
      setPlayers(players);
    });

    socket?.on("user-left", (userName, players) => {
      console.log(`${userName} meninggalkan room.`);
      setPlayers(players);
    });
  }, [socket]);

  useEffect(() => {
    // console.log("cek socket", socket);
    if (isUserSet) {
      socket?.emit("Join-Room", "room_1");
    }
  }, [isUserSet, socket]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("user", userName);
    setIsUserSet(true);
    socket?.emit("Set-Nick", userName);
  };

  const handleSendMessage = () => {
    const body = {
      sender: localStorage.getItem("user"),
      text: sen,
    };

    socket.emit("messages:post", body);
    setSen("");
  };

  const startGame = () => {
    console.log("Start Game clicked");
    socket.emit("generate-shuffled-card", "room_1");
  };

  return (
    <>
      <div className="App" style={{ display: "flex" }}>
        <div className="card-container me-20">
          <h1>Card Game</h1>
          {!isUserSet ? (
            <form
              className="flex max-w-md flex-col gap-4"
              onSubmit={handleFormSubmit}
            >
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Your name" />
                </div>
                <TextInput
                  id="name"
                  type="text"
                  placeholder=""
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          ) : (
            <>
              <button onClick={startGame} disabled={disabled}>
                Start Game
              </button>

              <div className="card-grid">
                {cards.map((card) => (
                  <SingleCard
                    key={card.id}
                    card={card}
                    handleChoice={handleChoice}
                    flipped={
                      card === choiceOne || card === choiceTwo || card.matched
                    }
                    disabled={disabled}
                  />
                ))}
              </div>
              <div>
                <h2>Room: room_1</h2>
                <h2>Players:</h2>
                <ul>
                  {players.map((player) => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
              <br />
              <p>Turns: {turns}</p>
            </>
          )}
        </div>

        <div className="chat-container">
          <div>
            <h1>Hello</h1>
            {messages.map((m) => {
              if (m.sender === localStorage.getItem("user")) {
                return (
                  <div
                    key={m.text + m.sender}
                    className="d-flex justify-content-end"
                  >
                    <p>
                      {m.text}:<strong>{m.sender}</strong>
                    </p>
                  </div>
                );
              }
              return (
                <div key={m.text + m.sender}>
                  <p>
                    <strong>{m.sender}</strong>: {m.text}
                  </p>
                </div>
              );
            })}
            <hr />
            <input
              value={sen}
              onChange={(e) => {
                setSen(e.target.value);
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}
