import React from "react"
import Die from "./Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

let count = 0
let initialTime
let lastTime = 0

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [timeRecord, setTimeRecord] = React.useState()
    const [countRecord, setCountRecord] = React.useState()
    const [showDiv, setShowDiv] = React.useState(false);

  

    // // Getting the record count and times values from local storage if there is one
    React.useEffect(() => {
        localStorage.getItem("count record") && setCountRecord(JSON.parse(localStorage.getItem("count record")))    
        localStorage.getItem("time record") && setTimeRecord(JSON.parse(localStorage.getItem("time record")))
     }, [])

    // updating the local storage count record value every time countRecord changes
    React.useEffect(() => {
        tenzies && localStorage.setItem("count record", JSON.stringify(countRecord))
    }, [tenzies, countRecord]) 

    // updating the local storage count record value every time timeRecord changes
    React.useEffect(() => {
        tenzies && localStorage.setItem("time record", JSON.stringify(timeRecord))
    }, [tenzies, timeRecord])

    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
            setTenzies(true)

            // show last result (count and time)
            setShowDiv(true)

            // change countRecord when game finish
            !countRecord && setCountRecord(count)
            count < countRecord && setCountRecord(count)

            // calculate time it takes 
            lastTime = (Date.now() - initialTime)/1000

            // set timeRecord
            !timeRecord && setTimeRecord(lastTime)
            lastTime < timeRecord && setTimeRecord(lastTime)

        }
    }, [dice])

    // show the last result only for 2 seconds and than hide it
    React.useEffect(() => {
        const timer = setTimeout(() => {
          setShowDiv(() => false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [showDiv]);

    // generate new dices if they are not held (green)
    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    // generate all new dices at the start of a new round
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    
    function rollDice() {
        count = count + 1
        // change the dices not held
        if(!tenzies) {
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))    
        }
        // set everything new if finish
        else {

            setTenzies(false)
            setDice(allNewDice())
            count = 0
        }
    }
    
    // Change dice property isHeld (green) 
    function holdDice(id) {
        // start counting the time at the first holdDice onClick
        if (count === 0 ){
          initialTime = Date.now()
        }
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    // create diceElements
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))

  

    return (
        <main>
            {/* show Confetti if won */}
            {tenzies && timeRecord && countRecord && <Confetti/> }
            <div className="nav">
                <div className="records">
                    <p>Rolls</p><span>{ countRecord }</span>
                    { showDiv && 
                        <div className="last">
                            <p>Rolls</p><span>{ count }</span>
                        </div> 
                    }   
                </div>
                
                <h1 className="title">Tenzies</h1>
                <div className="records">
                    <p>Time</p>{ timeRecord && <span>{ timeRecord }s</span> }
                    { showDiv && 
                        <div className="last">
                            <p>Last time</p>{ lastTime && <span>{ lastTime } s</span>}
                        </div>  
                    }                   
                </div>
            </div>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
        </main>
    )
}