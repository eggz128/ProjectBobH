let questionCell; //Holds(/will hold) current question cell

function init() {
    reset(); //Clear the board

    let cells = document.querySelectorAll("td"); //Doing this a lot... should probably do it just and store it in a const in scope to all functions

    //Assigns a click listener to all cells.
    cells.forEach(ref => {
        ref.addEventListener("click", event => {
            setLetter(event);
        })
    })

    assignStartLetter();
}

function reset() {
    let cells = document.querySelectorAll("td");
    //Recet cell styles
    cells.forEach(ref => {
        ref.classList.remove("active", "bl", "wh", "yl")
    })

    let shuffledLetters = letters //letters currently at bottom of file
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    //Swap hardcoded cell content for suffled letters
    let cellLetters = document.querySelectorAll("td > span");
    for (let cellLetter = 0; cellLetter < cellLetters.length; cellLetter++) {
        cellLetters[cellLetter].innerText = shuffledLetters[cellLetter];
    }
}

function assignStartLetter() {
    let cells = document.querySelectorAll("td");
    let rndcell = Math.floor(Math.random() * cells.length + 1);
    //cells[rndcell].classList.add("active")
    questionCell = cells[rndcell]

    setLetter(questionCell)
}


function setLetter(event) {
    if (event.currentTarget === undefined) { //if currentTarget is undefined it's because this function wasnt called by the event handler but instead intial setup
        questionCell.classList.add("active")
        questionCell.setAttribute("tabindex", "-1")
    } else {
        questionCell.classList.remove("active") //remove active from last question
        questionCell.removeAttribute("tabindex")
        event.currentTarget.classList.add("active") //set active on current question
        questionCell = event.currentTarget //set questionCell to current target
        questionCell.setAttribute("tabindex", "-1")
    }


    questionCell.focus()
    questionCell.addEventListener("keydown", setColour)


}
function setColour(e) {

    let key = e.key.toLowerCase()
    switch (key) {
        case "b":
            questionCell.classList.add("bl")
            break;
        case "w":

            questionCell.classList.add("wh")
            break;

        default:
            console.log(e) //Any other key cancels the anim
            break;
    }

    questionCell.classList.remove("active")

}

/* Random flash stuff */

var randomIntervalHandler;

function randomBoard() {
    reset();

    randomIntervalHandler = setInterval(function () {
        let cells = document.querySelectorAll("td");
        cells.forEach(ref => {
            let rnd = Math.floor(Math.random() * 3);
            ref.classList.remove("active", "bl", "wh", "yl")
            switch (rnd) {
                case 0:
                    ref.classList.add("bl")
                    break;
                case 1:
                    ref.classList.add("wh")
                    break;
                case 2:
                    ref.classList.add("yl")
                    break;

                default:
                    break;
            }

        })
    }, 500)
}

function stopRandom() {
    clearInterval(randomIntervalHandler)
}

/* Letters and Qs */
//ToDo: move this to external JSON

var en_letters = [
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
]

var cy_letters = [
    "A","B","C","Ch","D","Dd","E","F","Ff","G","Ng","H","I","J","L","Ll","M","N","O","P","Ph","R","Rh","S","T","Th","U","W","Y"
]

var letters = en_letters


