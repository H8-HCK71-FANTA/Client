import "./App.css";
import { useState, useEffect, useContext } from "react";
import SingleCard from "./components/SingleCard";
import { Button, Label, TextInput } from "flowbite-react";
// import { ToggleSwitch } from "flowbite-react";
import { ThemeContext } from "./contexts/ThemeContecxt";
import { useSocket } from "./hooks/useSocket";
import { ThemeProvider } from "./contexts/ThemeContecxt";

export default function App() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  // const [switch1, setSwitch1] = useState(false);

  const { theme, currentTheme, changeTheme } = useContext(ThemeContext);

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

  // console.log(switch1, "<<<< ini dari toggle")

  return (
    <>
      <ThemeProvider>

        <div className={`App flex w-full h-full px-20 py-5 ${theme[currentTheme].bgColor}`}>
          <div className="card-container w-3/4 me-10">
            <button className="cursor-pointer" onClick={changeTheme}>
              Change Theme
            </button>

            <h3 className={`text-2xl font-semibold ${theme[currentTheme].colorTextPrimary}`}>Memory Battle</h3>
            <form className="flex max-w-md flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Your name" />
                </div>
                <TextInput id="name" type="text" placeholder="" required />
              </div>
              <Button type="submit">Submit</Button>
            </form>

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

          <div className="main-chat-container shadow-xl h-fit">
            <div className={`players-container ${theme[currentTheme].bgColorHeader} p-3 rounded-ss-xl rounded-se-xl flex gap-3`}>
              <div className="box bg-[#45425a] w-1/2 p-2 rounded-lg borde">
                <p className="text-sm font-semibold">Player 1</p>
                <p>0 point</p>
              </div>
              <div className="box bg-[#45425a] w-1/2 p-2 rounded-lg">
                <p className="text-sm font-semibold">Player 2</p>
                <p>0 point</p>
              </div>
            </div>
            <div className={`chat-container flex-col max-h-[400px] ${theme[currentTheme].bgColorChat} overflow-auto`}>
              <div className="chat-view p-5 overflow-auto">
                <p className={`${theme[currentTheme].colorTextSecondary} italic text-sm mb-5`}>your conversation starts here</p>
                {messages.map((m) => {
                  if (m.sender === localStorage.getItem("user")) {
                    return (
                      <div className="flex items-start gap-2.5 justify-end mb-2" key={m.text + m.sender}>
                        <div className={`flex flex-col max-w-[250px] leading-1.5 pt-3 pb-2 px-3 border-gray-200 rounded-s-xl rounded-ee-xl ${theme[currentTheme].bgColorBubChat1}`}>
                          <div className="flex items-end space-x-2 rtl:space-x-reverse">
                            <span className={`text-sm font-semibold ${theme[currentTheme].colorTextPrimary}`}>
                              {m.sender}
                            </span>
                          </div>
                          <p className={`text-sm font-normal py-2.5 light:text-gray-900 ${theme[currentTheme].colorTextPrimary}`}>
                            {m.text}
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
                  onChange={(e) => {
                    setSen(e.target.value);
                  }}
                  className="w-full"
                />
                <div onClick={tanganiKirimPesan} className="p-3 py-1 rounded-lg flex items-center cursor-pointer bg-pink-700 hover:bg-pink-800">
                  <i className='bx bxs-paper-plane text-base'></i>
                </div>
              </form>
            </div>
          </div>
        </div >
      </ThemeProvider>
    </>
  );
}
