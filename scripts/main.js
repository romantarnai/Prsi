// for choosing colors
const choose_color = document.getElementById("choose_color");
const chooser = document.getElementById("chooser");

const human = document.getElementById("human");
const ai = document.getElementById("ai");
const center = document.getElementById("center");
const drawPile = document.getElementById("draw");
const coin = document.getElementById("coin");
let humanCards = [];
let aiCards = [];
let boardCards = [];
let deck_id = null;

// will change when player can play
let canPlay = false;

/* variables for special cards */
let activeSuit = "";
let eso = false;
let aiStop = false;
let sedma = false;
let kolikLizes = 0;

/* balicek na prsi */
const hodnoty = ["A", "J", "Q", "K", "7", "8", "9", "0"];
const barvy = ["S", "D", "C", "H"];
let kartyNaPrsi = [];
hodnoty.map((x) => {
    barvy.map((y) => {
        kartyNaPrsi.push(x + "" + y);
    });
});

/* 
========================
 získa počáteční deckId
========================*/
const GetData = async () => {
    let res = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?cards=${kartyNaPrsi}`);
    let data = await res.json();
    deck_id = data.deck_id;
};

/* 
====================
lízne kartu na střed
====================*/
const DrawToCenter = async () => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=1`);
    drawn_cards = await drawn_cards.json();
    drawn_cards.cards.map((x) => {
        boardCards.push(x);
    });

    drawn_cards.cards.map((x) => {
        const card = document.createElement("img");
        card.src = x.image;

        coin.style.backgroundImage = `url(images/${x.suit}.png)`;
        activeSuit = x.suit;

        center.appendChild(card);
        setTimeout(() => {
            card.classList.add("drown");
        }, 50);
    });
};

/* 
====================
obnoví balíček na lízaní
====================*/
const RefillDraw = async () => {
    let boardCardsLenght = boardCards.length;
    let ReturnRequest = "";
    for (let i = 0; i < boardCardsLenght - 1; i++) {
        ReturnRequest += `${boardCards[boardCardsLenght - i - 1].code},`;
        boardCards.pop();
    }

    let returned = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/return/?cards=${ReturnRequest}`);
};

/* 
===============
 ai lízne kartu
===============*/
const DrawAi = async (amount) => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amount}`);
    drawn_cards = await drawn_cards.json();
    drawn_cards.cards.map((x) => {
        aiCards.push(x);
    });

    // refill draw pack
    // 8 je největší počet na líznutí takže stačí když jich tam zbýva alespoň 8
    if (drawn_cards.remaining < 9) {
        RefillDraw();
    }

    // reset sedmy
    if (amount > 1) kolikLizes = 0;

    drawn_cards.cards.map((x) => {
        const card = document.createElement("img");
        card.src = "images/card_back.png";

        ai.appendChild(card);
        setTimeout(() => {
            card.classList.add("drown");
        }, 50);
    });
};

/* 
===============
    tah ai
===============*/
const AiPlay = () => {
    let played = false;
    aiCards.map((x) => {
        if (Control(boardCards[0], x) && !played) {
            coin.style.backgroundImage = `url(images/${x.suit}.png)`;
            activeSuit = x.suit;
            /* ====== special card played ======= */
            if (x.value == "7") {
                sedma = true;
                kolikLizes += 2;
            } else if (x.value == "ACE") eso = true;
            else if (x.value == "QUEEN") {
                /* --- ai playing ace  --- */
                let suit = "";
                let suitsIn = [];
                aiCards.map((x) => {
                    suitsIn.push(x.suit);
                });

                let colors = [
                    {
                        suit: "SPADES",
                        value: 0,
                    },
                    {
                        suit: "HEARTS",
                        value: 0,
                    },
                    {
                        suit: "DIAMONDS",
                        value: 0,
                    },
                    {
                        suit: "CLUBS",
                        value: 0,
                    },
                ];

                suitsIn.forEach((e) => {
                    colors.map((x) => (x.suit == e ? (x.value += 1) : ""));
                });
                colors.sort((a, b) => (a.value < b.value ? 1 : -1));
                suit = colors[0].suit;

                activeSuit = suit;
                coin.style.backgroundImage = `url(images/${suit}.png)`;
                choose_color.style.visibility = "hidden";
                choose_color.style.pointerEvents = "none";
            }

            boardCards.unshift(x);
            aiCards = aiCards.filter((y) => y.image != x.image);
            played = true;
            ai.removeChild(ai.lastChild);
            Renew();
        }
    });

    if (eso && !played) {
        PassPath();
        return;
    }

    if (!played) {
        if (kolikLizes == 0) DrawAi(1);
        else {
            for (let i = 0; i < kolikLizes / 2; i++) {
                setTimeout(() => {
                    DrawAi(2);
                }, i * 350);
            }
            sedma = false;
            kolikLizes = 0;
        }
    }

    CoinMove("human");
    canPlay = true;
};

/* 
===============
lízání na klik
===============*/
drawPile.addEventListener("click", () => {
    if (eso) return;
    if (!canPlay) return;

    if (kolikLizes == 0) DrawPlayer(1);
    else {
        for (let i = 0; i < kolikLizes / 2; i++) {
            setTimeout(() => {
                DrawPlayer(2);
            }, i * 350);
        }
        sedma = false;
        kolikLizes = 0;
    }
    canPlay = false;
    CoinMove("ai");
    setTimeout(() => {
        AiPlay();
    }, Math.floor(Math.random() * 2500) + 1000); // random int from 1000 - 3500
});
/* 
===================
hráč si lízne kartu (přidá evenListenry pro manipulaci s kartama)
===================*/
const DrawPlayer = async (amount) => {
    let drawn_cards = await fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amount}`);
    drawn_cards = await drawn_cards.json();
    drawn_cards.cards.map((x) => {
        humanCards.push(x);
    });

    // refill draw pack
    // 8 je největší počet na líznutí takže stačí když jich tam zbýva alespoň 8
    if (drawn_cards.remaining < 9) {
        RefillDraw();
    }

    // reset sedmy
    if (amount > 1) kolikLizes = 0;

    /* event listeners */
    drawn_cards.cards.map((x) => {
        const card = document.createElement("img");
        card.src = x.image;

        /* přidá kartu do hráčovi ruky */
        human.appendChild(card);
        setTimeout(() => {
            card.classList.add("drown");
        }, 50);

        /* eventlisteners na prohlížení karet */
        card.addEventListener("mouseover", (e) => {
            e.target.style.zIndex = 1;
        });
        card.addEventListener("mouseleave", (e) => {
            e.target.style.zIndex = 0;
        });

        /* ===== eventlistener na zahrání karty ==== */
        card.addEventListener("click", (e) => {
            if (!canPlay) {
                WrongMove(e.target);
                return;
            }

            let viablePlay = false;

            /* najde data ke kartě a provede kontrola jestli je karta hratelná */
            humanCards.map((x) => {
                if (x.image == e.target.src) {
                    if (Control(boardCards[0], x)) {
                        viablePlay = true;
                    }
                }
            });

            /* jestli karta je hratelná odeber ji z ruky a přidej do středu */
            if (!viablePlay) {
                WrongMove(e.target);
                return;
            }

            humanCards.map((x) => {
                if (x.image == e.target.src) {
                    activeSuit = x.suit;
                    coin.style.backgroundImage = `url(images/${x.suit}.png)`;
                    /* special card played */
                    if (x.value == "7") {
                        sedma = true;
                        kolikLizes += 2;
                    } else if (x.value == "ACE") eso = true;
                    else if (x.value == "QUEEN") {
                        choose_color.style.visibility = "visible";
                        choose_color.style.pointerEvents = "all";
                    }

                    boardCards.unshift(x);
                }
            });
            humanCards = humanCards.filter((x) => x.image != e.target.src);

            Array.from(human.childNodes).map((c) => {
                if (c.src == e.target.src) c.remove();
            });

            canPlay = false;
            Renew();
            CoinMove("ai");
            // budeme muset čekat než si hráč vybere :|
            if (x.value != "QUEEN") {
                setTimeout(() => {
                    AiPlay();
                }, Math.floor(Math.random() * 2500) + 1000); // random int from 1000 - 3500
            }
        });
    });
};
/* 
======================
animace pro neplatný tah
====================== */
const WrongMove = (target) => {
    target.classList.remove("shakeAnim");
    target.offsetWidth;
    target.classList.add("shakeAnim");
};

/* 
======================
kontrola platného tahu
====================== */
const Control = (card1, card2) => {
    // card 1 == karta ve středu
    if (eso && card2.value != "ACE") return false;
    else if (sedma && card2.value != "7") return false;
    else if (card2.value == "QUEEN") return true; // měnič může na jakoukoliv barvu
    else if (card1.value == card2.value) return true;
    else if (activeSuit == card2.suit) return true; // ne vždy odpovídá položené kartě(měnič)
    else return false;
};

/* 
======================
obnoví kartu uprostřed
======================*/
const Renew = () => {
    Array.from(center.childNodes).map((x) => {
        if (x.nodeType != 3) {
            x.classList.remove("drown");
            x.style.visibility = "hidden";
            setTimeout(() => {
                x.src = boardCards[0].image;
                setTimeout(() => {
                    x.style.visibility = "visible";
                    x.classList.add("drown");
                }, 100);

                /* move to game over screen with delay dont set the timeout when not needed */
                if (aiCards.length != 0 || humanCards.length != 0) {
                    setTimeout(() => {
                        if (aiCards.length == 0) {
                            Won("ai");
                        } else if (humanCards.length == 0) {
                            Won("human");
                        }
                    }, 500); // to start after we place the last card to center
                }
            }, 250);
        }
    });
};

/* 
===============
kontrola výhry
===============*/
const Won = (who) => {
    if (who == "ai") {
        SetScore(who);
    } else if (who == "human") {
        SetScore(who);
    }
};
/* přenastavení skóre */
const SetScore = (who) => {
    let h = 0;
    let a = 0;
    /* set score */
    if (localStorage.getItem("score") != null) {
        const score = localStorage.getItem("score").split(":");
        h = score[0];
        a = score[1];
    }

    who == "ai" ? a++ : null;
    who == "human" ? h++ : null;

    localStorage.setItem("whoWon", who);
    localStorage.setItem("score", `${h}:${a}`);
    /* move to game over screen */
    window.location.href = "gameOver.html";
};

/* 
===============
výběr barvy u měniče
===============*/
Array.from(chooser.childNodes).map((x) => {
    if (x.nodeType == 3) return;

    x.addEventListener("click", (e) => {
        ChangeColor(e.target.alt.toUpperCase());
    });
});
/* změna barvy při výběru */
const ChangeColor = (color) => {
    activeSuit = color;
    coin.style.backgroundImage = `url(images/${color}.png)`;
    choose_color.style.visibility = "hidden";
    choose_color.style.pointerEvents = "none";

    setTimeout(() => {
        AiPlay();
    }, Math.floor(Math.random() * 2500) + 1000); // random int from 1000 - 3500
};

/* 
=============================
přehodí žeton na druhou stranu
=============================*/
const CoinMove = (where) => {
    if (where == "human") {
        coin.classList.remove("top");
        coin.classList.add("bottom");
    } else if (where == "ai") {
        coin.classList.remove("bottom");
        coin.classList.add("top");
    }
};
/* 
======================
předání žetonu při esu
====================== */
coin.addEventListener("click", () => {
    if (!eso) return;

    PassPath();
});
const PassPath = () => {
    if (canPlay) {
        canPlay = false;
        CoinMove("ai");
        setTimeout(() => {
            AiPlay();
        }, Math.floor(Math.random() * 2500) + 1000); // random int from 1000 - 3500
    } else {
        canPlay = true;
        CoinMove("human");
        console.log("human is playing");
    }

    eso = false;
};

/*
===============
   Start hry
===============*/
const Start = async () => {
    await GetData();
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            DrawPlayer(1);
            DrawAi(1);
        }, i * 350);
    }

    setTimeout(() => {
        DrawToCenter();
    }, 350 * 5);

    canPlay = true;
};

Start();
