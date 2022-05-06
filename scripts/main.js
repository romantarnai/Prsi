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

const getData = async () => {
    let res = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?cards=${kartyNaPrsi}`)
    let data = await res.json()
    deck_id = data.deck_id
}

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
        })

        human.appendChild(card)
        setTimeout(()=>{
            card.classList.add("drown")
        }, 50)
    })
}

const renew = ()=>{
    console.log(boardCards)
    center.src = boardCards[0].image
}

const start = async ()=>{
    await getData()
    for(let i = 0; i < 5; i++){
        setTimeout(()=>{
            drawPlayer(1)
        }, i * 350)
    }
}

start()




/* drawing
const draw = async () => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`)  // deck id řeší to že je tam pouze daný množství karet
    drawn_cards = await drawn_cards.json()
    drawn_cards.cards.map(x => {
        cards.push(x);
    })


    drawn_cards.cards.map(x => {
        const card = document.createElement("img")
        card.src = x.image

        card.addEventListener("mouseover", (e) => {
            e.target.style.zIndex = 1
        })
        card.addEventListener("mouseleave", (e) => {
            e.target.style.zIndex = 0
        })


        card.addEventListener("click", (e) => {
            e.target.remove()
            cards.map(x => x.image == e.target.src ? anotherPack.push(x) : "")  // předá kartu někam jinam
            cards = cards.filter(x => x.image != e.target.src)  // odstraní kartu

            Array.from(cont2.childNodes).map(c => {
                c.remove()
            })

            anotherPack.map(x => {
                const karta = document.createElement("img")
                karta.src = x.image

                cont2.appendChild(karta)
            })

            if (cards.length == 0) {
                Array.from(cont2.childNodes).map(x => {
                    if (cont2.childNodes.length > 1)
                        x.remove()
                })
                while (anotherPack.length > 1) {
                    anotherPack.shift()
                }
            }
        })

        cont.appendChild(card)
        setTimeout(()=>{
            card.classList.add("drown")
        }, 50)

        console.log(drawn_cards)
    })
}
*/

/* using draw
drawBtn.addEventListener("click", ()=>{
    let sedmy = 4
    for(let i = 0; i < sedmy; i++){
        setTimeout(()=>{
            draw()
        }, i * 150)
    }  
})
*/