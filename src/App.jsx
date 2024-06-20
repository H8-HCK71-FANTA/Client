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
  const [currentRoom, setCurrentRoom] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const socket = useSocket();

  const handleChoice = (card) => {
    if (disabled || card.flipped || card.matched || currentPlayer !== socket.id)
      return;
    socket.emit("flip-card", card.id);
  };

  useEffect(() => {
    socket?.on("messages", (data) => {
      setMessages(data);
      scrollToBottom();
    });

    socket?.on("game-board-created", (cards) => {
      setCards(cards);
      setTurns(0);
      setChoiceOne(null);
      setChoiceTwo(null);
    });

    socket?.on("user-joined", (userName, players) => {
      setPlayers(players);
    });

    socket?.on("user-left", (userName, players) => {
      setPlayers(players);
    });

    socket?.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    socket?.on("card-flipped", (card) => {
      setCards((prevCards) =>
        prevCards.map((c) => (c.id === card.id ? card : c))
      );
      if (!choiceOne) {
        setChoiceOne(card);
      } else {
        setChoiceTwo(card);
      }
    });

    socket?.on("cards-matched", (cards) => {
      setCards((prevCards) =>
        prevCards.map((card) =>
          cards.find((c) => c.id === card.id)
            ? { ...card, matched: true }
            : card
        )
      );
      resetTurn();
    });

    socket?.on("cards-unmatched", (cards) => {
      setTimeout(() => {
        setCards((prevCards) =>
          prevCards.map((card) =>
            cards.find((c) => c.id === card.id)
              ? { ...card, flipped: false }
              : card
          )
        );
        resetTurn();
      }, 1000);
    });

    socket?.on("update-turn", (playerId) => {
      setCurrentPlayer(playerId);
    });
  }, [socket]);

  useEffect(() => {
    if (isUserSet && currentRoom) {
      socket?.emit("Join-Room", currentRoom);
    }
  }, [isUserSet, currentRoom, socket]);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("user", userName);
    setIsUserSet(true);
    socket?.emit("Set-Nick", userName);
  };

  const handleSendMessage = () => {
    if (!sen.trim()) return;
    const body = {
      sender: localStorage.getItem("user"),
      text: sen,
    };

    socket.emit("messages:post", body);
    setSen("");
  };

  const startGame = () => {
    socket.emit("generate-shuffled-card", currentRoom);
  };

  const handleRoomChange = (room) => {
    setCurrentRoom(room);
    setMessages([]);
  };

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".chat-container");
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };

  return (
    <>
      <div className="App" style={{ display: "flex" }}>
        <div className="card-container me-20">
          <h1>Game Bapuk</h1>
          {!isUserSet ? (
            <form
              className="flex max-w-md flex-col gap-4"
              onSubmit={handleFormSubmit}
            >
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="" />
                </div>
                <TextInput
                  id="name"
                  type="text"
                  placeholder=""
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  required
                />
              </div>
              <Button type="submit">Submit</Button>
            </form>
          ) : (
            <>
              <div className="room-selection">
                <button onClick={() => handleRoomChange("room_1")}>
                  Room 1
                </button>
                <button onClick={() => handleRoomChange("room_2")}>
                  Room 2
                </button>
              </div>

              <button onClick={startGame}>Start Game</button>

              <div className="card-grid">
                {cards.map((card) => (
                  <SingleCard
                    key={card.id}
                    card={card}
                    handleChoice={handleChoice}
                    flipped={card.flipped || card.matched}
                    disabled={disabled}
                  />
                ))}
              </div>
              <div>
                <h2>Room: {currentRoom}</h2>
                <h2>Players:</h2>
                <ul>
                  {players.map((player) => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
                <h3>
                  Player Turn:{" "}
                  {players.find((player) => player.id === currentPlayer)
                    ?.name || "None"}
                </h3>
              </div>
              <br />
              <p>Turns: {turns}</p>
            </>
          )}
        </div>

        <div className="chat-container">
          <div>
            <h1>Selingkuh / Main</h1>
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === localStorage.getItem("user")
                    ? "my-message"
                    : "other-message"
                }
              >
                <p>
                  <strong>{message.sender}</strong>: {message.text}
                </p>
              </div>
            ))}
          </div>
          <div className="message-input">
            <input
              value={sen}
              onChange={(event) => {
                setSen(event.target.value);
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}
