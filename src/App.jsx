import { useState, useEffect } from "react";
import "./App.css";
import SingleCard from "./components/SingleCard";
import { Button, Label, TextInput } from "flowbite-react";

// import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket";

export default function App() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);

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
      // alert("success nice");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //reset choices & increase turn
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };


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
      console.log({ cards });
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

  const start = () => {
    socket.emit("generate-shuffled-card")
  }

  return (
    <>
      <div className="App m-0 w-full px-20 py-5" style={{ display: "flex" }}>
        <div className="card-container me-20">
          <h3 className="text-2xl font-semibold">Memory Battle</h3>
          <form className="flex max-w-md flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Your name" />
              </div>
              <TextInput id="name" type="text" placeholder="" required />
            </div>
            <Button type="submit">Submit</Button>
          </form>


          {/* <button onClick={shuffleCards}>Start Game</button> */}
          <button onClick={start}>Start Game</button>

          <div className="card-grid">
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
          {messages.map((m) => {
            if (m.sender === localStorage.getItem("user")) {
              return (
                <div className="flex items-start gap-2.5 justify-end mb-2" key={m.text + m.sender}>
                  <div className="flex flex-col max-w-[320px] leading-1.5 pt-3 pb-2 px-5 border-gray-200 light:bg-gray-100 rounded-s-xl rounded-ee-xl bg-pink-900">
                    <div className="flex items-end space-x-2 rtl:space-x-reverse">
                      <span className="text-sm font-semibold light:text-gray-900 text-white">
                        {m.sender}
                      </span>
                      {/* <span className="text-sm font-normal light:text-gray-500 text-gray-400">
                        11:46
                      </span> */}
                    </div>
                    <p className="text-sm font-normal py-2.5 light:text-gray-900 text-white">
                      {m.text}
                    </p>
                    {/* <span className="text-sm font-normal light:text-gray-500 text-gray-400">
                      Delivered
                    </span> */}
                  </div>
                </div>
              );
            }
            return (
              <>
                <div className="flex items-start gap-2.5 mb-2" key={m.text + m.sender}>
                  <div className="flex flex-col max-w-[320px] leading-1.5 pt-3 pb-2 px-5 border-gray-200 light:bg-gray-100 rounded-e-xl rounded-es-xl bg-gray-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-sm font-semibold light:text-gray-900 text-white">
                        {m.sender}
                      </span>
                      {/* <span className="text-sm font-normal light:text-gray-500 text-gray-400">
                        11:46
                      </span> */}
                    </div>
                    <p className="text-sm font-normal py-2.5 light:text-gray-900 text-white">
                      {m.text}
                    </p>
                    {/* <span className="text-sm font-normal light:text-gray-500 text-gray-400">
                      Delivered
                    </span> */}
                  </div>
                </div>
              </>
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
    </>
  );
}
