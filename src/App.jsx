import "./App.css";

import SingleCard from "./components/SingleCard";
import { useState, useEffect, useContext } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { ThemeContext } from "./contexts/ThemeContext";
import { useSocket } from "./hooks/useSocket";


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

  const { theme, currentTheme, changeTheme } = useContext(ThemeContext);

  // handle a choice
  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };
  

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

    let count = 0;

    cards.forEach((card) => {
      if (card.matched === true) {
        count++;
      }
    });

    if (cards.length === count) {
      // alert("success nice");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    socket?.on("game-board-created", cards => {
      console.log({ cards });
      setCards(cards)
      setTurns(0);
      setChoiceOne(null);
      setChoiceTwo(null);
    })
  }, [socket]);

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
        <div className={`App flex w-full h-full px-20 py-5 ${theme[currentTheme].bgColor}`}>
          <div className="card-container w-3/4 me-10">
            <button className="cursor-pointer" onClick={changeTheme}>
              Change Theme
            </button>

            <h3 className={`text-2xl font-semibold ${theme[currentTheme].colorTextPrimary}`}>Memory Battle</h3>
            {!isUserSet ? (
            <form className="flex max-w-md flex-col gap-4"
             onSubmit={handleFormSubmit}>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Your name" />
                </div>
                <TextInput id="name" type="text" placeholder="your name" value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  required />
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
          </div>
          
          <div className="main-chat-container shadow-xl h-fit">
            <div className={`players-container ${theme[currentTheme].bgColorHeader} p-3 rounded-ss-xl rounded-se-xl flex gap-3`}>
              <div className={`box ${theme[currentTheme].bgColorPlayer} w-1/2 p-2 rounded-lg shadow-lg`}>
                <p className={`text-sm font-semibold ${theme[currentTheme].colorTextPrimary}`}>Player 1</p>
                <p className={`text-sm font-semibold ${theme[currentTheme].colorTextPrimary}`}>0 point</p>
              </div>
              <div className={`box ${theme[currentTheme].bgColorPlayer} w-1/2 p-2 rounded-lg shadow-lg`}>
                <p className={`text-sm font-semibold ${theme[currentTheme].colorTextPrimary}`}>Player 2</p>
                <p className={`text-sm font-semibold ${theme[currentTheme].colorTextPrimary}`}>0 point</p>
              </div>
            </div>
            <div className={`chat-container flex-col max-h-[400px] ${theme[currentTheme].bgColorChat} overflow-auto`}>
              <div className="chat-view p-5 overflow-auto">
                <p className={`${theme[currentTheme].colorTextSecondary} italic text-sm mb-5`}>your conversation starts here</p>
                {messages.map((message, index) => (
                  if (message.sender === localStorage.getItem("user")) {
                    return (
                      <div className="flex items-start gap-2.5 justify-end mb-2" key={index}>
                        <div className={`flex flex-col max-w-[250px] leading-1.5 pt-3 pb-2 px-3 border-gray-200 rounded-s-xl rounded-ee-xl ${theme[currentTheme].bgColorBubChat1}`}>
                          <div className="flex items-end space-x-2 rtl:space-x-reverse">
                            <span className={`text-sm font-semibold ${theme[currentTheme].colorTextPrimary}`}>
                              {message.sender}
                            </span>
                          </div>
                          <p className={`text-sm font-normal py-2.5 light:text-gray-900 ${theme[currentTheme].colorTextPrimary}`}>
                            {message.text}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="flex items-start gap-2.5 mb-2" key={m.text + m.sender}>
                        <div className={`flex flex-col max-w-[250px] leading-1.5 pt-3 pb-2 px-3 border-gray-200 rounded-e-xl rounded-es-xl ${theme[currentTheme].bgColorBubChat2}`}>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className={`text-sm font-semibold light:text-gray-900 ${theme[currentTheme].colorTextPrimary}`}>
                              {m.sender}
                            </span>
                          </div>
                          <p className={`text-sm font-normal py-2.5 light:text-gray-900 ${theme[currentTheme].colorTextPrimary}`}>
                            {m.text}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
            <div className={`input-chat ${theme[currentTheme].bgColorHeader} p-3 h-fit rounded-es-xl rounded-ee-xl`}>
              <form className="flex max-w-md gap-2">
                <TextInput
                  id="chat"
                  type="text"
                  placeholder="type here.."
                  value={sen}
                  onChange={(event) => {
                  setSen(event.target.value);
                  }}
                  className="w-full"
                />
                <div onClick={handleSendMessage} className="p-3 py-1 rounded-lg flex items-center cursor-pointer bg-pink-700 hover:bg-pink-800">
                  <i className='bx bxs-paper-plane text-base'></i>
                </div>
              </form>
            </div>
          </div>
        </div >
    </>
  );
}
