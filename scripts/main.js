const human = document.getElementById("human")
const ai = document.getElementById("ai")
const center = document.getElementById("center")
let humanCards = []
let aiCards = []
let boardCards = []
let deck_id = null

/* balicek na prsi */
const hodnoty = ["A", "J", "Q", "K", "7", "8", "9", "0"]
const barvy = ["S", "D", "C", "H"]
let kartyNaPrsi = []
hodnoty.map(x => {
    barvy.map(y => {
        kartyNaPrsi.push(x + "" + y)
    })
})

/* get data for main deck */
const getData = async () => {
    let res = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?cards=${kartyNaPrsi}`)
    let data = await res.json()
    deck_id = data.deck_id
}

/* draw to center */
const drawToCenter = async () =>{
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`)
    drawn_cards = await drawn_cards.json()
    drawn_cards.cards.map(x => {
        boardCards.push(x);
    })

    drawn_cards.cards.map(x => {
        const card = document.createElement("img")
        card.src = x.image

        center.appendChild(card)
        setTimeout(()=>{
            card.classList.add("drown")
        }, 50)
    })
}

/* draw for ai */
const drawAi = async amount => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amount}`)
    drawn_cards = await drawn_cards.json()
    drawn_cards.cards.map(x => {
        aiCards.push(x);
    })

    drawn_cards.cards.map(x => {
        const card = document.createElement("img")
        card.src = "../images/card_back.png"

        ai.appendChild(card)
        setTimeout(()=>{
            card.classList.add("drown")
        }, 50)
    })
}

/* draw for human player */
const drawPlayer = async amount => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amount}`)
    drawn_cards = await drawn_cards.json()
    drawn_cards.cards.map(x => {
        humanCards.push(x);
    })


    /* event listeners */
    drawn_cards.cards.map(x => {
        const card = document.createElement("img")
        card.src = x.image

        card.addEventListener("mouseover", e => {
            e.target.style.zIndex = 1
        })
        card.addEventListener("mouseleave", e => {
            e.target.style.zIndex = 0
        })

        card.addEventListener("click", (e)=>{
            let viablePlay = false

            humanCards.map(x => {
                if(x.image == e.target.src){
                    if(control(boardCards[0], x)){
                        viablePlay = true
                    }
                }
            })

            if(viablePlay){
                humanCards.map(x => {
                    if(x.image == e.target.src){
                        boardCards.unshift(x)
                    }
                })
                humanCards = humanCards.filter(x => x.image != e.target.src)
    
                Array.from(human.childNodes).map(c => {
                    if(c.src == e.target.src)
                        c.remove()
                })
    
                renew()
            } else{
                e.target.classList.remove("shakeAnim")
                e.target.offsetWidth
                e.target.classList.add("shakeAnim")
            }
            
        })

        human.appendChild(card)
        setTimeout(()=>{
            card.classList.add("drown")
        }, 50)
    })
}

/* zkontroluje jestli můžeme zahrát danou kartu */
const control = (card1, card2) => {     // card 1 == karta ve středu
    if(card1.value == card2.value)
        return true
    else if(card1.suit == card2.suit)
        return true
    else 
        return false
}

/* obnoví stav hry */
const renew = ()=>{
    Array.from(center.childNodes).map(x => {
        if(x.nodeType != 3)
        {
            x.classList.remove("drown")
            x.style.visibility = "hidden";
            x.offsetWidth;
            setTimeout(()=>{
                x.style.visibility = "visible"
                x.src = boardCards[0].image
                x.classList.add("drown")
            }, 250)
            
        }
    })
}

/* spustí se při startu hry */
const start = async ()=>{
    await getData()
    for(let i = 0; i < 5; i++){
        setTimeout(()=>{
            drawPlayer(1)
            drawAi(1)
        }, i * 350)
    }

    setTimeout(()=>{
        drawToCenter()
    }, 350 * 5)
}

start()
