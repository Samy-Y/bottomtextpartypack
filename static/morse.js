let gameLoop = false;
let audioContext = null;
let oscillator = null;

let words = [
    "yes","computer","maths","money","currency","cash",
    "laptop","food","pizza","phone","chair","table","ship",
    "ocean","sos","help","radio","antenna","air","time",
    "gold","navigate","guide","tree","binary","no","water",
    "receive","minerals","rocks","clothes","flower","sleep"
]

let raw_morse = document.getElementById("morse-written");
let decoded_morse = document.getElementById("morse-decoded");
let raw_morse_txt = ""

let selectedWords = [];
let currentWordIndex = 0;
let gameStartTime = 0;
let gameEndTime = 0;

/**
 * Decodes a string of Morse code into plain text.
 * @param {string} morseCode - The Morse code string to decode, with letters separated by spaces and words separated by double spaces.
 * @returns {string} - The decoded plain text string. Unrecognized sequences are replaced with "?".
 */
function decodeMorse(morseCode) {
    let ref = { 
        '.-':     'a',
        '-...':   'b',
        '-.-.':   'c',
        '-..':    'd',
        '.':      'e',
        '..-.':   'f',
        '--.':    'g',
        '....':   'h',
        '..':     'i',
        '.---':   'j',
        '-.-':    'k',
        '.-..':   'l',
        '--':     'm',
        '-.':     'n',
        '---':    'o',
        '.--.':   'p',
        '--.-':   'q',
        '.-.':    'r',
        '...':    's',
        '-':      't',
        '..-':    'u',
        '...-':   'v',
        '.--':    'w',
        '-..-':   'x',
        '-.--':   'y',
        '--..':   'z',
        '.----':  '1',
        '..---':  '2',
        '...--':  '3',
        '....-':  '4',
        '.....':  '5',
        '-....':  '6',
        '--...':  '7',
        '---..':  '8',
        '----.':  '9',
        '-----':  '0',
    };

    const trimmedCode = morseCode.trim();
    console.log(`decoding ${trimmedCode}`);
    
    // Split by space to get individual letters in Morse code
    const morseLetters = trimmedCode.split(' ');
    
    // Convert each Morse letter to its corresponding character
    const decodedLetters = morseLetters.map(letter => {
        // If the letter exists in our reference, return it, otherwise "?"
        return ref[letter] || "?";
    });
    
    // Join all letters into a single word
    return decodedLetters.join('');
}

function getRandomWords(arr) {
    const copy = arr.slice();
    const result = [];
    for (let i = 0; i < 10 && copy.length; i++) {
        const index = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(index, 1)[0]);
    }
    return result;
}

let t1 = 0;
let t2 = 0;
let interval = 0;

let first_pressed = false;
let game_begin = false
let music_playing = false;
let checkbox = document.getElementById('music');
const music = new Audio("../static/assets/morse-code-bg.mp3");

let text_space = document.getElementById('text-dictate');

let rectAnimating = false;
const canvas = document.getElementById("morse-canvas");
const ctx = canvas.getContext("2d");
let rectWidth = 100;  
const rectHeight = 50;
const rectRadius = 10;
const rectSpeed = 4;
let rectX, rectY;

// Global variables for rectangle animation:
let rectangles = [];           // Array holding all active rectangles
let animationRunning = false;  // Flag to determine if the animation loop is active

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
}

// I stole this code from copilot lmao
function animateRectangles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update each rectangle
    rectangles.forEach((rect) => {
        rect.x -= rect.speed;
        drawRoundedRect(ctx, rect.x, rect.y, rect.width, rect.height, rect.radius);
    });
    
    // Remove rectangles that have drifted completely off the canvas
    rectangles = rectangles.filter(rect => (rect.x + rect.width > 0));
    
    // Continue the animation if there are still rectangles
    if (rectangles.length > 0) {
        requestAnimationFrame(animateRectangles);
    } else {
        animationRunning = false;
    }
}

function addRectangle(width) {

    const newRect = {
        x: canvas.width,
        y: (canvas.height - rectHeight) / 2,
        width: width,
        height: rectHeight,
        radius: rectRadius,
        speed: rectSpeed
    };

    rectangles.push(newRect);
    
    if (!animationRunning) {
        animationRunning = true;
        requestAnimationFrame(animateRectangles);
    }

}

function resetGame() {
    raw_morse_txt = "";
    raw_morse.innerHTML = "";
    decoded_morse.innerHTML = "";
    first_pressed = false;
    game_begin = false;
    gameLoop = false;
    currentWordIndex = 0;
    selectedWords = [];
}

document.addEventListener('keydown', (event) => {

    if (event.code === 'Space' && !oscillator) {

        console.log('Space pressed');

        if (!audioContext) {
            console.log('Creating audio context');
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (checkbox.checked && !music_playing && !gameLoop) {
            console.log('Playing music');
            music.loop = true;
            music_playing = true;
            console.log("Music is now playing.")
            music.play().catch(error => {
                console.log('Error playing music', error);
            }
            );
        }

        if(!game_begin && !first_pressed){

            first_pressed = true;
            countdown = audioContext.createOscillator();

            for (let i = 7; i > 0; i--) {
                setTimeout(() => {
                    text_space.innerHTML = i.toString();
                }, (7 - i + 1) * 900 + 150);
                
            }

            setTimeout(() => {
                game_begin = true;
                text_space.innerHTML = "GO!";
                
                // Select 10 random words
                selectedWords = getRandomWords(words);
                console.log("Selected words:", selectedWords);
                
                // Show the first word after a short delay
                setTimeout(() => {
                    text_space.innerHTML = selectedWords[0];
                    gameStartTime = Date.now();
                }, 500);
            }, 900 * 8 + 150);

            console.log('Game begin');
        }

        console.log('Creating oscillator');

        if (gameLoop === false) {
            gameLoop = true;
            console.log('Game loop started');
        }

        // I understood nothing to this :-)
        if(game_begin){

            t1 = Date.now();

            if (t1 - t2 > 400) {
                console.log("t1 - t2 =", t1 - t2)
                console.log("Adding a space!")
                raw_morse.innerHTML += " "
                raw_morse_txt += " "
            }

            oscillator = audioContext.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.connect(audioContext.destination);
            oscillator.start();
        }
    
    } else if (event.code == 27 && gameLoop === true) {
        
        resetGame();
        console.log("Game loop stopped");

        const audio = document.querySelector("audio");
        if (audio) {
            audio.pause();
        }

        if (music_playing) {
            console.log("Music is now stopped.");
            music.pause();
            music_playing = false;
        }
    }
});

function checkWordCompletion() {
    const decodedText = decodeMorse(raw_morse_txt);
    const currentWord = selectedWords[currentWordIndex].toLowerCase();
    
    if (decodedText.toLowerCase().includes(currentWord)) {
        console.log("Word completed:", currentWord);
        
        // Move to next word
        currentWordIndex++;
        raw_morse_txt = "";
        raw_morse.innerHTML = "";
        
        // Check if game is complete
        if (currentWordIndex >= selectedWords.length) {
            // Game complete!
            gameEndTime = Date.now();
            const timeInSeconds = ((gameEndTime - gameStartTime) / 1000).toFixed(2);
            
            text_space.innerHTML = `You won in ${timeInSeconds}s! Restart to play again.`;
            
            // Stop the game
            gameLoop = false;
            game_begin = false;
            
            if (music_playing) {
                music.pause();
                music_playing = false;
            }
        } else {
            // Show next word
            text_space.innerHTML = selectedWords[currentWordIndex];
        }
    }
}

document.addEventListener('keyup', (event) => {

    if (event.code === 'Space' && oscillator) {

        t2 = Date.now();
        interval = t2 - t1;

        if (interval < 200) {
            raw_morse.innerHTML += "."
            raw_morse_txt += "."
        } else {
            raw_morse.innerHTML += "-"
            raw_morse_txt += "-"
        }

        decoded_morse.innerHTML = decodeMorse(raw_morse_txt);
        
        // Check if the current word is completed
        if (game_begin && currentWordIndex < selectedWords.length) {
            checkWordCompletion();
        }

        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;

        rectWidth = Math.min(canvas.width, Math.max(15, interval / 5));
        console.log("Rectangle width based on press time: ", rectWidth);
        addRectangle(rectWidth);

    }
});