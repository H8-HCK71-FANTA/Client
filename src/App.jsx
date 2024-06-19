import { useState, useEffect } from "react";
import "./App.css";
import SingleCard from "./components/SingleCard";

// import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket";

// const cardImages = [
//   { src: "/img/helmet-1.png", matched: false },
//   { src: "/img/potion-1.png", matched: false },
//   { src: "/img/ring-1.png", matched: false },
//   { src: "/img/scroll-1.png", matched: false },
//   { src: "/img/shield-1.png", matched: false },
//   { src: "/img/sword-1.png", matched: false },
// ];

export default function App() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [sendCard, setSendCard] = useState([])
  // shuffle cards
  // const shuffleCards = () => {
  //   const shuffledCards = [...cardImages, ...cardImages]
  //     .sort(() => Math.random() - 0.5)
  //     .map((card) => ({ ...card, id: Math.random() }));

  //   setChoiceOne(null);
  //   setChoiceTwo(null);
  //   setCards(shuffledCards);
  //   setTurns(0);
  // };

  // handle a choice
  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };


  // compare 2 selected cards
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
          console.log(card.matched, "truee");
          if (card.matched === true) {
            count++;
          }
        });

        console.log(count, "<<<< count");

        if (cards.length === count) {
          alert("success nice");
        }
  }, []);

  //reset choices & increase turn
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };

  // start a new game
  // useEffect(() => {
  //   shuffleCards();
  // }, []);



  //socket ni boss
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [sen, setSen] = useState("");

  useEffect(() => {
    // 4. message nya di terima di kedua client
    // optional chaining
    socket?.on("messages", (data) => {
      setMessages(data);
    });

    socket?.emit("Join-Room", "room_1")

    socket?.on("game-board-created", cards => {
      console.log({cards});
      setCards(cards)
      setTurns(0);
      setChoiceOne(null);
      setChoiceTwo(null);
    })
  }, [socket]);

  // FLOW SOCKET.IO
  // 1. kita kirim pesan dari client ke server
  let tanganiKirimPesan = () => {
    const body = {
      sender: localStorage.getItem("user"),
      text: sen,
    };

    socket.emit("messages:post", body);

    setSen("");
  };

  let handleSendCards = () => {
    const body = {
      sender: localStorage.getItem("user"),
      data: cards
    }

    socket.emit("cards:post", body);
    setSendCard([]);
  }

  const start = () => {
    socket.emit("generate-shuffled-card")
  }
  return (
    <>
      <div className="App" style={{ display: "flex" }}>
        <div className="card-container me-20">
          <h1>Card Game</h1>
          {/* <button onClick={shuffleCards}>Start Game</button> */}
          <button onClick={start}>Start Game</button>

          <div className="card-grid" onClick={handleSendCards}>
            {cards.map((card) => (
              <SingleCard
                key={card.id}
                card={card}
                handleChoice={handleChoice}
                flipped={card === choiceOne || card === choiceTwo || card.matched}
                disabled={disabled}
              />
            ))}
          </div>
          <p>Turns: {turns}</p>
        </div>

        <div className="chat-container">
          {/* socket */}
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
            <button onClick={tanganiKirimPesan}>Kirim</button>
          </div>
        </div>
      </div>
    </>
  );
}
