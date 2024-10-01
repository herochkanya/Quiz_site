let signs = ['+', '-', '*'];
let container_main = document.querySelector('.main');
let container_start = document.querySelector('.start');
let container_start_h3 = container_start.querySelector('h3');
let question_field = document.querySelector('.question');
let answer_buttons = document.querySelectorAll('.answer');
let start_button = document.querySelector('.start-btn');
let countdownLine = document.createElement('div');
let countdownFill = document.createElement('div');
let question_timer;
let countdownDuration = 5; // Countdown duration in seconds

let cookie = false;
let cookies = document.cookie.split('; ');

for (let i = 0; i < cookies.length; i += 1) {
    if (cookies[i].split('=')[0] == 'numbers_high_score') {
        cookie = cookies[i].split('=')[1];
        break;
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

if (cookie) {
    let data = cookie.split('/');
    container_start_h3.innerHTML = `<h3>Минулого разу ви дали ${data[1]} правильних відповідей із ${data[0]}. Точність - ${Math.round(data[1] * 100 / data[0])}%.</h3>`;
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function getRandomSign() {
    return signs[randint(0, 2)];
}

class Question {
    constructor() {
        let a = randint(1, 30);
        let b = randint(1, 30);
        let sign = getRandomSign();
        this.question = `${a} ${sign} ${b}`;
        if (sign == '+') {
            this.correct = a + b;
        } else if (sign == '-') {
            this.correct = a - b;
        } else if (sign == '*') {
            this.correct = a * b;
        }
        this.answers = new Set();
        this.answers.add(this.correct);
        while (this.answers.size < 5) {
            let wrongAnswer = randint(this.correct - 20, this.correct + 20);
            if (wrongAnswer !== this.correct) {
                this.answers.add(wrongAnswer);
            }
        }
        this.answers = Array.from(this.answers);
        shuffle(this.answers);
    }

    display() {
        question_field.innerHTML = this.question;
        for (let i = 0; i < this.answers.length; i += 1) {
            answer_buttons[i].innerHTML = this.answers[i];
        }
    }
}

let current_question;
let correct_answers_given;
let total_answers_given;
let total_questions = 0;

function startNewQuestion() {
    if (total_questions < 10) {
        current_question = new Question();
        current_question.display();
        total_questions += 1;

        // Initialize and start countdown
        startCountdown(countdownDuration);
    } else {
        endGame();
    }
}

function endGame() {
    clearTimeout(question_timer);
    let new_cookie = `numbers_high_score=${correct_answers_given}/${total_answers_given}; max-age=10000000000`;
    document.cookie = new_cookie;

    container_main.style.display = 'none';
    container_start.style.display = 'flex';
    container_start_h3.innerHTML = `<h3>Ви дали ${correct_answers_given} правильних відповідей із ${total_answers_given}. Точність - ${Math.round(correct_answers_given * 100 / total_answers_given)}%.</h3>`;
}

// Countdown functionality
function startCountdown(duration) {
    let remainingTime = duration;
    const widthStep = 100 / duration;

    // Create and style countdown elements
    countdownLine.className = 'countdown-line';
    countdownFill.className = 'countdown-fill';
    countdownLine.appendChild(countdownFill);
    
    // Clear previous countdown bar if exists
    const existingCountdown = document.querySelector('.countdown-line');
    if (existingCountdown) {
        container_main.removeChild(existingCountdown);
    }

    container_main.appendChild(countdownLine);
    
    countdownFill.style.width = '100%'; // Reset the width

    question_timer = setInterval(() => {
        remainingTime--;

        if (remainingTime <= 0) {
            clearInterval(question_timer);
            total_answers_given += 1; // Count this as an answer given
            startNewQuestion(); // Generate new question if time is up
            return;
        }

        countdownFill.style.width = `${remainingTime * widthStep}%`;
    }, 1000); // Update every second
}

start_button.addEventListener('click', function () {
    container_main.style.display = 'flex';
    container_start.style.display = 'none';

    correct_answers_given = 0;
    total_answers_given = 0;
    total_questions = 0;

    startNewQuestion();
});

for (let i = 0; i < answer_buttons.length; i += 1) {
    answer_buttons[i].addEventListener('mouseenter', function () {
        anime({
            targets: answer_buttons[i],
            background: '#eaeaea',
            duration: 200,
            easing: 'easeInOutQuad'
        });
    });

    answer_buttons[i].addEventListener('mouseleave', function () {
        anime({
            targets: answer_buttons[i],
            background: '#d4d4d4',
            duration: 200,
            easing: 'easeInOutQuad'
        });
    });

    answer_buttons[i].addEventListener('click', function () {
        answer_buttons.forEach(button => button.style.background = '#d4d4d4'); // Reset button colors

        if (parseInt(answer_buttons[i].innerHTML) === current_question.correct) {
            correct_answers_given += 1;
            answer_buttons[i].style.background = '#0BBF7D'; // Green for correct answer
        } else {
            answer_buttons[i].style.background = '#A60F1B'; // Red for wrong answer
        }

        total_answers_given += 1;

        clearTimeout(question_timer); // Clear timer after answer click
        startNewQuestion(); // Generate new question after answering
    });
}
